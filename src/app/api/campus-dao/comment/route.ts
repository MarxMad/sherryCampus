import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { proposalId, author, content } = await req.json();
    if (!proposalId || !author || !content) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Simulación de almacenamiento
    const comment = {
      proposalId,
      author,
      content,
      timestamp: new Date().toISOString(),
    };

    // Aquí podrías guardar en una base de datos real

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 