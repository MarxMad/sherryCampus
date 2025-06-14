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
    const vote = searchParams.get('vote');
    const delegateTo = searchParams.get('delegateTo');
    const reason = searchParams.get('reason') || '';

    if (!proposalId || !vote) {
      return NextResponse.json(
        { error: 'ID de propuesta y voto son requeridos' },
        { status: 400 }
      );
    }

    let data;
    if (delegateTo) {
      // Calldata para delegar voto
      data = encodeFunctionData({
        abi: abi,
        functionName: 'delegateVote',
        args: [delegateTo as `0x${string}`],
      });
    } else {
      // Calldata para votar
      let support;
      if (vote === 'yes' || vote === 'sí') support = true;
      else if (vote === 'no') support = false;
      else return NextResponse.json({ error: 'Voto inválido' }, { status: 400 });
      data = encodeFunctionData({
        abi: abi,
        functionName: 'voteProposal',
        args: [BigInt(proposalId), support, reason],
      });
    }

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
    console.error('Error en petición POST:', error);
    return NextResponse.json({ error: 'Error Interno del Servidor' }, {
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