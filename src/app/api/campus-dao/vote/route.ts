import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { createMetadata, Metadata, ValidatedMetadata, ExecutionResponse } from '@sherrylinks/sdk';
import { serialize } from 'wagmi';

export async function POST(req: NextRequest) {
  try {
    // Paso 1: Extraer parámetros de la URL
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');
    const vote = searchParams.get('vote');

    if (!proposalId || !vote) {
      return NextResponse.json(
        { error: 'ID de propuesta y voto son requeridos' },
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

    // Validar que el voto sea "sí" o "no"
    if (vote !== 'sí' && vote !== 'no') {
      return NextResponse.json(
        { error: 'El voto debe ser "sí" o "no"' },
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
      to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52', // Reemplazar con la dirección del contrato
      data: '0x', // Aquí irá el calldata para vote
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