import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import { serialize } from 'wagmi';
import { ExecutionResponse } from '@sherrylinks/sdk';
import { abi } from '../../blockchain/abi';

const CONTRACT_ADDRESS = '0xf5f14C03B7B7a22b0C536B7b992abb67dF2EFbb3';

export async function POST(req: NextRequest) {
  try {
    console.log('Iniciando petición POST para seguir propuesta');
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');

    if (!proposalId) {
      console.log('Error: ID de propuesta no proporcionado');
      return NextResponse.json(
        { error: 'ID de propuesta es requerido' },
        { status: 400 }
      );
    }

    console.log('Procesando propuesta ID:', proposalId);

    const data = encodeFunctionData({
      abi: abi,
      functionName: 'followProposal',
      args: [BigInt(proposalId)],
    });

    console.log('Transacción codificada:', data);

    const tx = {
      to: CONTRACT_ADDRESS,
      data,
      value: BigInt(0),
      chainId: avalancheFuji.id,
    };

    console.log('Transacción preparada:', tx);

    const serialized = serialize(tx);
    const resp: ExecutionResponse = {
      serializedTransaction: serialized,
      chainId: avalancheFuji.name,
    };

    console.log('Respuesta preparada:', resp);

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
      { 
        error: 'Error Interno del Servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
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

// Simulamos una base de datos en memoria para los seguidores
// En producción, esto debería ser una base de datos real
const followers = new Map<string, Set<string>>();

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');

    if (!proposalId) {
      return NextResponse.json(
        { error: 'ID de propuesta no proporcionado' },
        { status: 400 }
      );
    }

    // Obtener la dirección de la wallet del usuario desde los headers
    const userAddress = req.headers.get('x-user-address');
    if (!userAddress) {
      return NextResponse.json(
        { error: 'No se proporcionó la dirección de la wallet' },
        { status: 401 }
      );
    }

    // Remover el usuario de los seguidores
    followers.get(proposalId)?.delete(userAddress);

    return NextResponse.json({
      success: true,
      message: 'Has dejado de seguir esta propuesta',
      data: {
        proposalId,
        followersCount: followers.get(proposalId)?.size || 0
      }
    });

  } catch (error) {
    console.error('Error al dejar de seguir la propuesta:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');

    if (!proposalId) {
      return NextResponse.json(
        { error: 'ID de propuesta no proporcionado' },
        { status: 400 }
      );
    }

    // Obtener la dirección de la wallet del usuario desde los headers
    const userAddress = req.headers.get('x-user-address');
    if (!userAddress) {
      return NextResponse.json(
        { error: 'No se proporcionó la dirección de la wallet' },
        { status: 401 }
      );
    }

    // Verificar si el usuario sigue la propuesta
    const isFollowing = followers.get(proposalId)?.has(userAddress) || false;

    return NextResponse.json({
      success: true,
      data: {
        proposalId,
        isFollowing,
        followersCount: followers.get(proposalId)?.size || 0
      }
    });

  } catch (error) {
    console.error('Error al verificar el estado de seguimiento:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// Función auxiliar para notificar a los seguidores
export async function notifyFollowers(proposalId: string, eventType: string, data: any) {
  const proposalFollowers = followers.get(proposalId);
  if (!proposalFollowers) return;

  // Aquí implementarías la lógica real de notificación
  // Por ejemplo, enviar emails, push notifications, etc.
  console.log(`Notificando a ${proposalFollowers.size} seguidores de la propuesta ${proposalId}`);
  console.log(`Evento: ${eventType}`, data);
} 