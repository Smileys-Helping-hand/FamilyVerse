import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const adminEmail = process.env.ADMIN_EMAIL || 'mraaziqp@gmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD;

        // Minimal credential check: email must match and password must match env secret
        if (credentials.email === adminEmail && adminPassword && credentials.password === adminPassword) {
          return { id: adminEmail, email: adminEmail } as any;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = (user as any).email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        session.user = { email: token.email } as any;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
