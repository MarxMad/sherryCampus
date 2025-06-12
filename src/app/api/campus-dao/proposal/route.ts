import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import { serialize } from 'wagmi';
import { ExecutionResponse } from '@sherrylinks/sdk';
import { abi } from '../blockchain/abi';

const CONTRACT_ADDRESS = '0x8aD6bEa6027a4006EDd49E86Ec6E5A8dEf0a63d2';

export async function POST(req: NextRequest) {
  try {
    // Extraer parámetros solo de los query params
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || '';
    const description = searchParams.get('description') || '';

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Título y descripción son requeridos', title, description },
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

    console.log('Crear propuesta - title:', title, 'description:', description);

    try {
      console.log('Antes de encodeFunctionData');
      const data = encodeFunctionData({
        abi: abi,
        functionName: 'createProposal',
        args: [title, description],
      });
      console.log('Calldata generado:', data);

      console.log('Antes de serializar');
      const tx = {
        to: CONTRACT_ADDRESS,
        data,
        value: BigInt(0),
        chainId: avalancheFuji.id,
      };
      const serialized = serialize(tx);
      console.log('Transacción serializada:', serialized);

      // Responde como espera Sherry
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
      console.error('Error en generación de calldata o serialización:', error);
      return NextResponse.json(
        { error: 'Error Interno del Servidor', details: String(error) },
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
  } catch (error) {
    console.error('Error en petición POST:', error);
    return NextResponse.json(
      { error: 'Error Interno del Servidor' },
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