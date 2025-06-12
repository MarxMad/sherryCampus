import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import { serialize } from 'wagmi';
import { ExecutionResponse } from '@sherrylinks/sdk';
import { abi } from '../blockchain/abi';

const CONTRACT_ADDRESS = '0x8aD6bEa6027a4006EDd49E86Ec6E5A8dEf0a63d2';

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

    // Codifica el calldata para createProposal(string,string)
    const data = encodeFunctionData({
      abi: abi,
      functionName: 'createProposal',
      args: [title, description],
    });

    // Construye la transacción
    const tx = {
      to: CONTRACT_ADDRESS,
      data,
      value: BigInt(0),
      chainId: avalancheFuji.id,
    };

    // Serializa la transacción
    const serialized = serialize(tx);

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