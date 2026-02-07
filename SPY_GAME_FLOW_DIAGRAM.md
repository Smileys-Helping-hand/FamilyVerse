```mermaid
flowchart TD
    Start([🎮 Start Party Game]) --> Setup[/party/spy-game/setup]
    
    Setup -->|Configure| Config{Setup Complete?}
    Config -->|No| Setup
    Config -->|Yes| Choice{Choose Mode}
    
    Choice -->|Start Game| Reveal[/party/spy-game/reveal]
    Choice -->|Print Cards| Print[/party/spy-game/print]
    
    Reveal --> Player1[Player 1: COVER View]
    Player1 -->|Tap| Role1{Spy or Civilian?}
    Role1 -->|Spy| SpyView1[Red: YOU'RE A SPY]
    Role1 -->|Civilian| CivView1[Green: WORD]
    
    SpyView1 -->|Tap Again| Player2[Player 2: COVER View]
    CivView1 -->|Tap Again| Player2
    
    Player2 -->|Continue...| LastPlayer[Last Player Reveals]
    LastPlayer -->|Auto Redirect| Active[/party/spy-game/active]
    
    Print --> Generate[Generate QR Codes]
    Generate --> Download[Download/Share]
    Download --> Physical[Players Scan Cards]
    Physical --> Active
    
    Active --> Timer[Countdown Timer]
    Timer --> Warning{Time = 10:00?}
    Warning -->|Yes| Alert1[🔔 Play alarm.mp3]
    Alert1 --> Continue[Timer Continues]
    Warning -->|No| Continue
    
    Continue --> End{Time = 00:00?}
    End -->|No| Continue
    End -->|Yes| Alert2[🚨 Play emergency.mp3]
    
    Alert2 --> Vote[VOTE NOW Overlay]
    Vote --> Result([🏆 Reveal Results])
    
    Active -.->|Host Control| Hint[💡 Send Hint]
    Hint --> Continue
    
    Active -.->|Admin View| Spy[👁️ See Spy Identity]
    
    Result -->|New Game| Setup
    
    style Setup fill:#9333ea
    style Reveal fill:#2563eb
    style Active fill:#dc2626
    style Print fill:#ec4899
    style SpyView1 fill:#dc2626
    style CivView1 fill:#16a34a
    style Vote fill:#dc2626
```
