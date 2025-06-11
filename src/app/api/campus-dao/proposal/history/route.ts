import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');

    if (!proposalId) {
      return NextResponse.json({ error: 'proposalId es requerido' }, { status: 400 });
    }

    // Simulación de historial
    const history = [
      {
        timestamp: '2024-06-01T10:00:00Z',
        action: 'Creación',
        author: '0x1234...abcd',
        description: 'Propuesta creada',
      },
      {
        timestamp: '2024-06-02T12:00:00Z',
        action: 'Voto',
        author: '0x5678...efgh',
        description: 'Voto a favor',
      },
      {
        timestamp: '2024-06-03T15:00:00Z',
        action: 'Comentario',
        author: '0x9abc...def0',
        description: 'Me parece una excelente idea',
      },
    ];

    return NextResponse.json({ proposalId, history });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 