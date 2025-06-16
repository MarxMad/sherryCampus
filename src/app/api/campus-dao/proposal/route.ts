import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import { serialize } from 'wagmi';
import { ExecutionResponse } from '@sherrylinks/sdk';
import { abi } from '../blockchain/abi';

const CONTRACT_ADDRESS = '0xf5f14C03B7B7a22b0C536B7b992abb67dF2EFbb3';

export async function POST(req: NextRequest) {
  try {
    console.log('Iniciando petición POST');
    let title: string | undefined;
    let description: string | undefined;
    let category: string | undefined;

    // Intentar obtener los datos del body primero
    try {
      console.log('Intentando leer body...');
      const body = await req.json();
      console.log('Body recibido:', body);
      title = body.title;
      description = body.description;
      category = body.category;
    } catch (e) {
      console.log('No se pudo leer body, intentando query params...');
      // Si no hay body, intentar obtener de query params
      const searchParams = req.nextUrl.searchParams;
      console.log('Query params:', Object.fromEntries(searchParams.entries()));
      title = searchParams.get('title') || undefined;
      description = searchParams.get('description') || undefined;
      category = searchParams.get('category') || undefined;
    }

    console.log('Parámetros obtenidos:', { title, description, category });

    // Validar campos requeridos
    if (!title || !description || !category) {
      console.log('Faltan campos requeridos');
      return NextResponse.json(
        { error: 'Título, descripción y categoría son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el título y la descripción no estén vacíos
    if (title.trim().length === 0 || description.trim().length === 0) {
      console.log('Campos vacíos detectados');
      return NextResponse.json(
        { error: 'El título y la descripción no pueden estar vacíos' },
        { status: 400 }
      );
    }

    // Decodificar los parámetros si vienen codificados
    title = decodeURIComponent(title);
    description = decodeURIComponent(description);
    category = decodeURIComponent(category);

    console.log('Parámetros decodificados:', { title, description, category });

    // Codificar la transacción para crear la propuesta
    console.log('Codificando transacción...');
    const data = encodeFunctionData({
      abi,
      functionName: 'createProposal',
      args: [title, description, category],
    });
    console.log('Transacción codificada:', data);

    // Preparar la transacción
    const tx = {
      to: CONTRACT_ADDRESS,
      data,
      value: BigInt(0),
      chainId: avalancheFuji.id,
    };
    console.log('Transacción preparada:', tx);

    // Serializar la transacción para Sherry
    console.log('Serializando transacción...');
    const serialized = serialize(tx);
    console.log('Transacción serializada:', serialized);

    const resp: ExecutionResponse = {
      serializedTransaction: serialized,
      chainId: avalancheFuji.name,
    };

    console.log('Respuesta preparada:', resp);

    return NextResponse.json(resp, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error detallado en petición POST:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json(
      { 
        error: 'Error Interno del Servidor', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 