import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import { serialize } from 'wagmi';
import { ExecutionResponse } from '@sherrylinks/sdk';
import { abi } from '../blockchain/abi';

const CONTRACT_ADDRESS = '0x8aD6bEa6027a4006EDd49E86Ec6E5A8dEf0a63d2';

export async function POST(req: NextRequest) {
  try {
    const { proposalId, author, content } = await req.json();
    if (!proposalId || !author || !content) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }
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
    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 