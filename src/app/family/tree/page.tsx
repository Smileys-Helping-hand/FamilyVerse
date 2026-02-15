'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { getFamilyTreeData } from '@/app/actions/family-tree';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { getPusherClient } from '@/lib/pusher/client';
import {
  Users,
  Plus,
  Maximize2,
  Download,
  RefreshCw,
  TreePine,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const pusherClient = getPusherClient();

// Custom Profile Node Component
function ProfileNode({ data }: { data: any }) {
  const generation = data.generation || 0;
  const isRealUser = data.type === 'user';
  const deceased = data.deathYear !== null && data.deathYear !== undefined;

  return (
    <Card
      className={`min-w-[200px] cursor-pointer hover:shadow-lg transition-shadow ${
        deceased ? 'opacity-75' : ''
      }`}
      onClick={() => data.onClick?.(data)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={data.avatarUrl} />
            <AvatarFallback>{data.displayName?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{data.displayName}</p>
            {data.birthYear && (
              <p className="text-xs text-gray-500">
                {data.birthYear}
                {deceased && ` - ${data.deathYear}`}
              </p>
            )}
            <Badge variant="outline" className="mt-1 text-xs">
              Gen {generation}
            </Badge>
          </div>
        </div>
        {!isRealUser && (
          <Badge variant="secondary" className="mt-2 text-xs">
            👻 Ancestor
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

const nodeTypes = {
  profile: ProfileNode,
};

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 120, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 110,
        y: nodeWithPosition.y - 50,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function FamilyTreePage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [treeData, setTreeData] = useState<any>(null);

  useEffect(() => {
    loadFamilyTree();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = pusherClient.subscribe('family-tree');

    channel.bind('relationship-created', () => {
      loadFamilyTree();
      toast({
        title: 'Tree Updated',
        description: 'A new relationship was added to the family tree',
      });
    });

    channel.bind('shadow-user-created', () => {
      loadFamilyTree();
      toast({
        title: 'Tree Updated',
        description: 'A new ancestor was added to the tree',
      });
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe('family-tree');
    };
  }, [user]);

  async function loadFamilyTree() {
    const result = await getFamilyTreeData();
    if (!result.success) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    setTreeData(result.data);
    buildTree(result.data);
    setLoading(false);
  }

  function buildTree(data: any) {
    const { relationships, shadowUsers, users } = data;

    // Build person map (combine real users and shadow users)
    const personMap = new Map();
    users.forEach((u: any) => {
      personMap.set(u.id, { ...u, type: 'user' });
    });
    shadowUsers.forEach((s: any) => {
      personMap.set(s.id, { ...s, type: 'shadow' });
    });

    // Calculate generations
    const generations = new Map<string, number>();
    const visited = new Set<string>();

    function calculateGeneration(personId: string, gen: number): void {
      if (visited.has(personId)) return;
      visited.add(personId);

      generations.set(personId, Math.max(generations.get(personId) || 0, gen));

      // Find children
      const childRels = relationships.filter(
        (r: any) => r.parentId === personId && r.relationshipType !== 'PARTNER' && r.relationshipType !== 'SPOUSE'
      );

      childRels.forEach((rel: any) => {
        if (rel.childId) {
          calculateGeneration(rel.childId, gen + 1);
        }
      });
    }

    // Start from roots (people without parents)
    const allChildren = new Set(
      relationships
        .filter((r: any) => r.childId && r.relationshipType !== 'PARTNER' && r.relationshipType !== 'SPOUSE')
        .map((r: any) => r.childId)
    );
    const roots = Array.from(personMap.keys()).filter((id) => !allChildren.has(id));

    roots.forEach((rootId) => calculateGeneration(rootId, 1));

    // Build nodes
    const newNodes: Node[] = Array.from(personMap.values()).map((person) => ({
      id: person.id,
      type: 'profile',
      position: { x: 0, y: 0 }, // Will be set by dagre
      data: {
        ...person,
        generation: generations.get(person.id) || 1,
        onClick: setSelectedPerson,
      },
    }));

    // Build edges
    const newEdges: Edge[] = relationships
      .filter((rel: any) => rel.parentId && rel.childId && rel.relationshipType !== 'PARTNER' && rel.relationshipType !== 'SPOUSE')
      .map((rel: any) => ({
        id: rel.id,
        source: rel.parentId,
        target: rel.childId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        label:
          rel.relationshipType === 'ADOPTED'
            ? '(Adopted)'
            : rel.relationshipType === 'STEP'
            ? '(Step)'
            : '',
      }));

    // Apply dagre layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      newNodes,
      newEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TreePine className="w-6 h-6 text-green-600" />
              Living Family Tree
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {nodes.length} people • {edges.length} connections
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadFamilyTree} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link href="/family/wizard">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Relationship
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg">
            <div className="text-sm space-y-2">
              <p className="font-semibold">💡 Navigation Tips</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Click & drag to pan</li>
                <li>• Scroll to zoom</li>
                <li>• Click a person to see details</li>
              </ul>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Profile Slide-over (Simple version) */}
      {selectedPerson && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              onClick={() => setSelectedPerson(null)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
            >
              ✕
            </Button>

            <div className="mt-8">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={selectedPerson.avatarUrl} />
                <AvatarFallback>
                  {selectedPerson.displayName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-bold text-center mt-4">
                {selectedPerson.displayName}
              </h2>

              {selectedPerson.email && (
                <p className="text-center text-gray-600 text-sm mt-1">
                  {selectedPerson.email}
                </p>
              )}

              <div className="mt-6 space-y-4">
                {selectedPerson.birthYear && (
                  <div>
                    <p className="text-sm font-semibold">Birth Year</p>
                    <p className="text-gray-600">{selectedPerson.birthYear}</p>
                  </div>
                )}

                {selectedPerson.deathYear && (
                  <div>
                    <p className="text-sm font-semibold">Death Year</p>
                    <p className="text-gray-600">{selectedPerson.deathYear}</p>
                  </div>
                )}

                {selectedPerson.bio && (
                  <div>
                    <p className="text-sm font-semibold">Bio</p>
                    <p className="text-gray-600">{selectedPerson.bio}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold">Generation</p>
                  <Badge>Gen {selectedPerson.generation}</Badge>
                </div>

                <div>
                  <p className="text-sm font-semibold">Type</p>
                  <Badge variant={selectedPerson.type === 'user' ? 'default' : 'secondary'}>
                    {selectedPerson.type === 'user' ? '👤 App User' : '👻 Ancestor'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
