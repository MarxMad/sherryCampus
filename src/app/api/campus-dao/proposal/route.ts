import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { createMetadata, ExecutionResponse } from '@sherrylinks/sdk';
import { serialize } from 'wagmi';

export const metadata = createMetadata({
  label: 'Crear Propuesta',
  description: 'Crea una nueva propuesta para la DAO estudiantil. Requiere título y descripción.',
  params: [
    {
      name: 'title',
      label: 'Título de la Propuestddddda',
      type: 'text',
      required: true,
      description: 'Ingresa el título de tu propuesta',
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      description: 'Describe los detalles de tu propuesta',
    },
  ],
  response: {
    type: 'object',
    properties: {
      serializedTransaction: { type: 'string', description: 'Transacción serializada para la blockchain' },
      chainId: { type: 'string', description: 'Nombre de la red blockchain' },
    },
  },
  examples: [
    {
      title: 'Implementar sistema de votación electrónica',
      description: 'Propuesta para modernizar el sistema de votación estudiantil',
    },
  ],
});

export async function POST(req: NextRequest) {
  try {
    // Extraer parámetros del body o de la URL
    let title = '';
    let description = '';
    if (req.headers.get('content-type')?.includes('application/json')) {
      const body = await req.json();
      title = body.title;
      description = body.description;
    } else {
      const { searchParams } = new URL(req.url);
      title = searchParams.get('title') || '';
      description = searchParams.get('description') || '';
    }

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Título y descripción son requeridos' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Crear la transacción para el contrato inteligente
    const tx = {
      to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52', // Dirección del contrato
      data: '0x', // Aquí irá el calldata para createProposal
      value: BigInt(0),
      chainId: avalancheFuji.id,
    };

    // Serializar la transacción para la blockchain
    const serialized = serialize(tx);

    // Crear el objeto de respuesta que Sherry espera
    const resp: ExecutionResponse = {
      serializedTransaction: serialized,
      chainId: avalancheFuji.name,
    };

    // Retornar la respuesta con headers CORS
    return NextResponse.json(resp, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error en petición POST:', error);
    return NextResponse.json(
      { error: 'Error Interno del Servidor' },
      { status: 500 }
    );
  }
} 