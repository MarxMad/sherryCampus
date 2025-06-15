import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { abi, CONTRACT_ADDRESS } from '../../blockchain/abi';

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

// Función auxiliar para obtener el historial
async function getProposalHistory(proposalId: string) {
  // 1. Leer el estado actual de la propuesta
  let proposal = null;
  try {
    proposal = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'getProposal',
      args: [BigInt(proposalId)],
    });
  } catch (e) {
    // Si no existe la propuesta, proposal se queda en null
  }

  // 2. Leer el historial de eventos
  const latestBlock = await client.getBlockNumber();
  const fromBlock = latestBlock > BigInt(2048) ? latestBlock - BigInt(2048) : BigInt(0);
  const events = await client.getLogs({
    address: CONTRACT_ADDRESS,
    fromBlock,
    toBlock: latestBlock,
    events: [
      {
        ...abi.find(e => e.name === 'ProposalCreated' && e.type === 'event'),
        args: { id: BigInt(proposalId) }
      },
      {
        ...abi.find(e => e.name === 'Voted' && e.type === 'event'),
        args: { proposalId: BigInt(proposalId) }
      },
      {
        ...abi.find(e => e.name === 'Commented' && e.type === 'event'),
        args: { proposalId: BigInt(proposalId) }
      }
    ]
  });

  const history = events.map((log) => {
    const l = log as any; // Forzar acceso dinámico
    const eventName = l.eventName || l._eventName || 'Evento';
    const args = l.args || l._args || {};
    let action = eventName;
    let author = '';
    let description = '';
    let timestamp = 0;
    if (eventName === 'ProposalCreated') {
      author = args.creator;
      description = `Propuesta creada: ${args.title}`;
      timestamp = Number(args.createdAt) * 1000;
    } else if (eventName === 'Voted') {
      author = args.voter;
      description = `Voto: ${args.support ? 'A favor' : 'En contra'}`;
      timestamp = 0;
    } else if (eventName === 'Commented') {
      author = args.commenter;
      description = `Comentario: ${args.comment}`;
      timestamp = Number(args.timestamp) * 1000;
    }
    return {
      action,
      author,
      description,
      timestamp,
      blockNumber: l.blockNumber,
    };
  });

  return { proposalId, proposal, history };
}

// Headers CORS comunes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');
    if (!proposalId) {
      return NextResponse.json(
        { error: 'proposalId es requerido' }, 
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const result = await getProposalHistory(proposalId);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      {
        status: 500,
        headers: corsHeaders
      }
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
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const result = await getProposalHistory(proposalId);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
} 