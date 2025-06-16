import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import { serialize } from 'wagmi';
import { ExecutionResponse } from '@sherrylinks/sdk';
import { abi } from '../blockchain/abi';

const CONTRACT_ADDRESS = '0xf5f14C03B7B7a22b0C536B7b992abb67dF2EFbb3';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');
    const author = searchParams.get('author');
    const content = searchParams.get('content');
    if (!proposalId || !author || !content) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }
    console.log('Comentar propuesta - proposalId:', proposalId, 'author:', author, 'content:', content);
    const data = encodeFunctionData({
      abi: abi,
      functionName: 'commentProposal',
      args: [BigInt(proposalId), author, content],
    });
    const tx = {
      to: CONTRACT_ADDRESS,
      data,
      value: BigInt(0),
      chainId: avalancheFuji.id,
    };
    const serialized = serialize(tx);
    const resp: ExecutionResponse = {
      serializedTransaction: serialized,
      chainId: avalancheFuji.name,
    };
    return NextResponse.json(resp, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
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