# Pocket OACI: UI Mockup (Boceto)

## The "Black Box" Interface
The design philosophy is "Cockpit-Ready". High contrast, dark mode, minimal distractions.

### Wireframe

```mermaid
graph TD
    A[Status Bar: 12:00 UTC | Battery 80% | Connection: Online]
    B[Header: OACI.ai Logo (Left) | Language Toggle: ES/EN (Right)]
    C[Main Display Area: 'The Black Box']
    D[Input Area: Microphone Icon | Text Input | Send Button]
    
    subgraph "The Black Box"
        E[User: 'What are the holding speeds above FL140?']
        F[AI Response: 'Maximum holding speeds are...']
        G[Citation Card: 'Source: ICAO Doc 8168, Vol I, Part II...']
    end

    A --> B
    B --> C
    C --> E
    C --> F
    F --> G
    C --> D
```

### Visual Style (ASCII Concept)

```text
+--------------------------------------------------+
|  OACI.ai  ✈️                          [ES] / EN  |
+--------------------------------------------------+
|                                                  |
|                                                  |
|   +------------------------------------------+   |
|   |  USER:                                   |   |
|   |  ¿Cuáles son los mínimos de CAT II?      |   |
|   +------------------------------------------+   |
|                                                  |
|   +------------------------------------------+   |
|   |  OACI AI:                                |   |
|   |  Para una aproximación de Precisión      |   |
|   |  Categoría II (CAT II):                  |   |
|   |                                          |
|   |  • DH (Altura de Decisión): < 60m (200ft)|   |
|   |    pero >= 30m (100ft).                  |   |
|   |  • RVR (Alcance Visual en Pista):        |   |
|   |    >= 300m.                              |   |
|   |                                          |
|   |  [FUENTE: Anexo 6, Parte I]              |   |
|   +------------------------------------------+   |
|                                                  |
|                                                  |
+--------------------------------------------------+
|  [ 🎤 ]   Escribe tu duda aquí...         [ ➤ ]  |
+--------------------------------------------------+
```

### Color Palette
- **Background**: `#0a0a0a` (Deep Black)
- **Text**: `#e5e5e5` (Light Grey)
- **Accents**: `#00d4ff` (Cyan - Information) / `#ffb700` (Amber - Warnings)
