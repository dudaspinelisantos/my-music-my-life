/* Configuração opcional do Supabase.
   O app funciona em modo demonstração sem configuração ou internet.
   Para habilitar a nuvem, preencha SUPABASE_URL e SUPABASE_ANON_KEY.
   Nunca coloque a service_role key no frontend. */
(function () {
  const SUPABASE_URL = "";
  const SUPABASE_ANON_KEY = "";
  window.mmlSupabase = null;
  window.mmlSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
  if (window.mmlSupabaseConfigured) {
    window.mmlSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
})();
