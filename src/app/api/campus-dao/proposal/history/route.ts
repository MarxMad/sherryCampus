import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { abi, CONTRACT_ADDRESS } from '../../blockchain/abi';

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');
    if (!proposalId) {
      return NextResponse.json({ error: 'proposalId es requerido' }, { status: 400 });
    }

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
    const events = await client.getLogs({
      address: CONTRACT_ADDRESS,
      fromBlock: 'earliest',
      toBlock: 'latest',
      events: [
        { event: 'ProposalCreated', args: { id: BigInt(proposalId) } },
        { event: 'Voted', args: { proposalId: BigInt(proposalId) } },
        { event: 'Commented', args: { proposalId: BigInt(proposalId) } },
      ],
      abi,
    });

    const history = events.map((log) => {
      const { eventName, args, blockNumber } = log;
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
        blockNumber,
      };
    });

    return NextResponse.json({ proposalId, proposal, history });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
} 