import { NextRequest, NextResponse } from 'next/server';
import { createMetadata, Metadata, ValidatedMetadata } from '@sherrylinks/sdk';

export async function GET(req: NextRequest) {
  try {
    // Obtener información de la URL del servidor
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';

    // Construir la URL base
    const serverUrl = `${protocol}://${host}`;

    const metadata: Metadata = {
      url: 'https://sherry.social',
      icon: 'https://maroon-accused-carp-261.mypinata.cloud/ipfs/QmTM58hVZih4PtgraeRaASt6U6eGgcEE2MmaK3Ub66F8hv',
      title: 'CampusDAO Connect by CriptoUNAM',
      baseUrl: serverUrl,
      description: 'Plataforma de gobernanza estudiantil y networking universitario',
      actions: [
        {
          type: 'dynamic',
          label: 'Crear Propuesta',
          description: 'Crea una nueva propuesta para votación en la DAO estudiantil. Debes subir una foto, un título claro y una descripción detallada.',
          chains: { source: 'fuji' },
          path: `/api/campus-dao/proposal`,
          params: [
            {
              name: 'title',
              label: 'Título de la Propuesta',
              type: 'text',
              required: true,
              description: 'Escribe el título de tu propuesta. Debe ser breve y descriptivo.'
            },
            {
              name: 'description',
              label: 'Descripción',
              type: 'textarea',
              required: true,
              description: 'Describe los detalles, objetivos y beneficios de tu propuesta.'
            },
            {
              name: 'category',
              label: 'Categoría',
              type: 'select',
              required: true,
              description: 'Selecciona la categoría de tu propuesta.',
              options: [
                { label: 'Académico', value: 'academic' },
                { label: 'Eventos', value: 'events' },
                { label: 'Infraestructura', value: 'infrastructure' },
                { label: 'Otro', value: 'other' }
              ]
            }
          ],
        },
        {
          type: 'dynamic',
          label: 'Votar Propuesta',
          description: 'Vota por una propuesta existente. Ingresa el ID de la propuesta y selecciona tu voto.',
          chains: { source: 'fuji' },
          path: `/api/campus-dao/vote`,
          params: [
            {
              name: 'proposalId',
              label: 'ID de la Propuesta',
              type: 'text',
              required: true,
              description: 'Ingresa el identificador único de la propuesta que deseas votar.'
            },
            {
              name: 'vote',
              label: 'Tu Voto',
              type: 'select',
              required: true,
              description: 'Selecciona tu voto para esta propuesta.',
              options: [
                { label: 'A favor', value: 'yes' },
                { label: 'En contra', value: 'no' },
                { label: 'Abstención', value: 'abstain' },
              ],
            },
            {
              name: 'delegateTo',
              label: 'Delegar Voto (opcional)',
              type: 'text',
              required: false,
              description: 'Dirección de la wallet a la que deseas delegar tu voto (opcional).'
            },
            {
              name: 'reason',
              label: 'Razón del Voto',
              type: 'textarea',
              required: false,
              description: 'Explica brevemente tu decisión de voto (opcional).'
            }
          ],
        },
        {
          type: 'dynamic',
          label: 'Seguir Propuesta',
          description: 'Sigue una propuesta para recibir actualizaciones.',
          chains: { source: 'fuji' },
          path: `/api/campus-dao/proposal/follow`,
          params: [
            {
              name: 'proposalId',
              label: 'ID de la Propuesta',
              type: 'text',
              required: true,
              description: 'Identificador único de la propuesta a seguir.'
            }
          ],
        },
        {
          type: 'dynamic',
          label: 'Analizar Propuesta',
          description: 'Obtén análisis y estadísticas detalladas sobre una propuesta.',
          chains: { source: 'fuji' },
          path: `/api/campus-dao/proposal/analyze`,
          params: [
            {
              name: 'proposalId',
              label: 'ID de la Propuesta',
              type: 'text',
              required: true,
              description: 'Identificador único de la propuesta a analizar.'
            },
            {
              name: 'analysisType',
              label: 'Tipo de Análisis',
              type: 'select',
              required: true,
              description: 'Selecciona el tipo de análisis que deseas ver.',
              options: [
                { label: 'Tendencia de votos', value: 'vote_trend' },
                { label: 'Participación', value: 'participation' },
                { label: 'Análisis de sentimiento', value: 'sentiment' },
                { label: 'Predicción de resultado', value: 'prediction' }
              ]
            }
          ],
        }
      ],
    };

    // Validar metadata usando el SDK
    const validated: ValidatedMetadata = createMetadata(metadata);

    // Retornar con headers CORS para acceso cross-origin
    return NextResponse.json(validated, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creando metadata:', error);
    return NextResponse.json(
      { error: 'Error al crear metadata' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
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
      'Content-Type': 'application/json',
    },
  });
} 