import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { abi } from '../../blockchain/abi';

const CONTRACT_ADDRESS = '0xf5f14C03B7B7a22b0C536B7b992abb67dF2EFbb3';

// Tipos para los datos del contrato
type Vote = {
  voter: `0x${string}`;
  support: boolean;
  reason: string;
  timestamp: bigint;
  delegatedFrom: `0x${string}`;
};

type Comment = {
  commenter: `0x${string}`;
  nameOrAddress: string;
  comment: string;
  timestamp: bigint;
};

type Follower = {
  follower: `0x${string}`;
  timestamp: bigint;
  isFollowing: boolean;
};

type Proposal = {
  id: bigint;
  creator: `0x${string}`;
  title: string;
  description: string;
  category: string;
  votesFor: bigint;
  votesAgainst: bigint;
  createdAt: bigint;
  exists: boolean;
};

// Crear cliente público para interactuar con la blockchain
const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http()
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');
    const analysisType = searchParams.get('analysisType');

    console.log('[ANALYZE] Params:', { proposalId, analysisType });

    if (!proposalId || !analysisType) {
      console.log('[ANALYZE] Faltan parámetros');
      return NextResponse.json(
        { error: 'ID de propuesta y tipo de análisis son requeridos' },
        { status: 400 }
      );
    }

    let analysis = null;
    try {
      switch (analysisType) {
        case 'vote_trend': {
          const votes = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: abi,
            functionName: 'getVotes',
            args: [BigInt(proposalId)]
          }) as readonly Vote[];
          analysis = analyzeVoteTrend([...votes]);
          break;
        }
        case 'participation': {
          const votes = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: abi,
            functionName: 'getVotes',
            args: [BigInt(proposalId)]
          }) as readonly Vote[];
          const followers = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: abi,
            functionName: 'getFollowers',
            args: [BigInt(proposalId)]
          }) as readonly Follower[];
          analysis = analyzeParticipation([...votes], [...followers]);
          break;
        }
        case 'sentiment': {
          const comments = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: abi,
            functionName: 'getComments',
            args: [BigInt(proposalId)]
          }) as readonly Comment[];
          analysis = analyzeSentiment([...comments]);
          break;
        }
        case 'prediction': {
          const votes = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: abi,
            functionName: 'getVotes',
            args: [BigInt(proposalId)]
          }) as readonly Vote[];
          const proposal = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: abi,
            functionName: 'getProposal',
            args: [BigInt(proposalId)]
          }) as Proposal;
          analysis = predictOutcome([...votes], proposal);
          break;
        }
        default:
          console.log('[ANALYZE] Tipo de análisis no válido');
          return NextResponse.json(
            { error: 'Tipo de análisis no válido' },
            { status: 400 }
          );
      }
    } catch (err) {
      console.error('[ANALYZE] Error en lectura de contrato:', err);
      return NextResponse.json({ error: 'Error leyendo datos del contrato', details: String(err) }, { status: 500 });
    }

    if (!analysis) {
      console.log('[ANALYZE] Sin datos para análisis');
      return NextResponse.json({ error: 'Sin datos para análisis' }, { status: 404 });
    }

    console.log('[ANALYZE] Resultado:', analysis);
    return NextResponse.json(analysis, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('[ANALYZE] Error general:', error);
    return NextResponse.json({ error: 'Error Interno del Servidor', details: String(error) }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

// Función para analizar tendencia de votos
function analyzeVoteTrend(votes: Vote[]) {
  const voteTimeline = votes.map(vote => ({
    timestamp: Number(vote.timestamp),
    support: vote.support,
    reason: vote.reason
  }));

  // Ordenar por timestamp
  voteTimeline.sort((a, b) => a.timestamp - b.timestamp);

  // Calcular tendencia
  const totalVotes = voteTimeline.length;
  const yesVotes = voteTimeline.filter(v => v.support).length;
  const noVotes = totalVotes - yesVotes;

  return {
    type: 'vote_trend',
    totalVotes,
    yesVotes,
    noVotes,
    yesPercentage: (yesVotes / totalVotes) * 100,
    noPercentage: (noVotes / totalVotes) * 100,
    timeline: voteTimeline
  };
}

// Función para analizar participación
function analyzeParticipation(votes: Vote[], followers: Follower[]) {
  const totalFollowers = followers.length;
  const activeVoters = votes.length;
  const participationRate = (activeVoters / totalFollowers) * 100;

  return {
    type: 'participation',
    totalFollowers,
    activeVoters,
    participationRate,
    inactiveFollowers: totalFollowers - activeVoters
  };
}

// Función para analizar sentimiento
function analyzeSentiment(comments: Comment[]) {
  // Aquí podrías implementar un análisis de sentimiento más sofisticado
  // Por ahora, simplemente contamos los comentarios
  return {
    type: 'sentiment',
    totalComments: comments.length,
    commentTimeline: comments.map(comment => ({
      timestamp: Number(comment.timestamp),
      comment: comment.comment
    }))
  };
}

// Función para predecir resultado
function predictOutcome(votes: Vote[], proposal: Proposal) {
  const totalVotes = votes.length;
  const yesVotes = votes.filter(v => v.support).length;
  const noVotes = totalVotes - yesVotes;

  // Predicción simple basada en votos actuales
  const currentYesPercentage = (yesVotes / totalVotes) * 100;
  const prediction = currentYesPercentage > 50 ? 'likely_to_pass' : 'likely_to_fail';

  return {
    type: 'prediction',
    currentYesPercentage,
    currentNoPercentage: 100 - currentYesPercentage,
    prediction,
    confidence: Math.abs(currentYesPercentage - 50) // Más lejos de 50% = más confianza
  };
}

export async function POST(req: NextRequest) {
  try {
    let proposalId: string | null = null;
    let analysisType: string | null = null;
    // Intentar leer del body
    try {
      const body = await req.json();
      proposalId = body.proposalId;
      analysisType = body.analysisType;
    } catch {
      // Si falla, intentar leer de query params
      const { searchParams } = new URL(req.url);
      proposalId = searchParams.get('proposalId');
      analysisType = searchParams.get('analysisType');
    }
    if (!proposalId || !analysisType) {
      return NextResponse.json(
        { error: 'ID de propuesta y tipo de análisis son requeridos' },
        { status: 400 }
      );
    }
    // Reusar la lógica del GET
    const reqGet = { ...req, url: req.url } as NextRequest;
    (reqGet as any).nextUrl = { searchParams: new URLSearchParams({ proposalId, analysisType }) };
    return await GET(reqGet);
  } catch (error) {
    console.error('Error en análisis (POST):', error);
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