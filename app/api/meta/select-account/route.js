export const dynamic = 'force-dynamic';
const db = require('@/lib/db');
const { syncMetaAds } = require('@/lib/meta');

export async function POST(request) {
  try {
    const formData = await request.formData();
    const accountId = formData.get('account_id');
    const tokenId = formData.get('token_id');

    if (!accountId || !tokenId) {
      return new Response('Dados inválidos', { status: 400 });
    }

    // Atualiza o ad_account_id no token salvo
    db.prepare('UPDATE meta_tokens SET ad_account_id = ? WHERE id = ?')
      .run(accountId, parseInt(tokenId));

    // Dispara sync imediato
    syncMetaAds();

    // Redireciona para o dashboard
    return new Response(null, {
      status: 302,
      headers: { Location: '/?meta=connected' },
    });
  } catch (err) {
    return new Response(`Erro: ${err.message}`, { status: 500 });
  }
}
