import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import { serialize } from 'wagmi';
import { ExecutionResponse } from '@sherrylinks/sdk';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../../contract';

export async function POST(req: NextRequest) {
  try {
    const { proposalId, author, content } = await req.json();
    if (!proposalId || !author || !content) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const data = encodeFunctionData({
      abi: CONTRACT_ABI,
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
    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 