import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { abi, CONTRACT_ADDRESS } from '../../blockchain/abi';

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function serializeBigInt(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = serializeBigInt(obj[key]);
    }
    return newObj;
  } else if (typeof obj === 'bigint') {
    return obj.toString();
  }
  return obj;
}

async function getProposalOnly(proposalId: string) {
  try {
    const proposal = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getProposal',
      args: [BigInt(proposalId)],
    });
    return { proposalId, proposal: serializeBigInt(proposal) };
  } catch (e: any) {
    const errorMsg = String(e?.message || e);
    console.error('Error al leer estado de la propuesta:', errorMsg);
    if (errorMsg.includes('La propuesta no existe')) {
      // Error específico del contrato
      return { proposalId, proposal: null, error: 'La propuesta no existe' };
    }
    // Otro error
    return { proposalId, proposal: null, error: errorMsg };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');
    if (!proposalId) {
      return NextResponse.json(
        { error: 'proposalId es requerido' },
        { status: 400, headers: corsHeaders }
      );
    }
    const result = await getProposalOnly(proposalId);
    if (result.error === 'La propuesta no existe') {
      return NextResponse.json(result, { status: 404, headers: corsHeaders });
    } else if (result.error) {
      return NextResponse.json(result, { status: 500, headers: corsHeaders });
    }
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');
    if (!proposalId) {
      return NextResponse.json(
        { error: 'proposalId es requerido' },
        { status: 400, headers: corsHeaders }
      );
    }
    const result = await getProposalOnly(proposalId);
    if (result.error === 'La propuesta no existe') {
      return NextResponse.json(result, { status: 404, headers: corsHeaders });
    } else if (result.error) {
      return NextResponse.json(result, { status: 500, headers: corsHeaders });
    }
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
} 