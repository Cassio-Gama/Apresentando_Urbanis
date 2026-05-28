import React, { useState } from 'react';
import { useUrbanStore } from '../store/useUrbanStore';
import { KeyRound, Mail, Sparkles, AlertCircle, Play } from 'lucide-react';
import logo from '../assets/urbanis_logo_transparent.png';

export function Login() {
  const { login, signUp, setOfflineMode } = useUrbanStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          setErrorMsg('A senha precisa ter no mínimo 6 caracteres para garantir a segurança.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password);
        if (error) throw error;
      } else {
        const { error } = await login(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro ao processar sua solicitação de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark w-full min-h-screen bg-[#0a0b0d]">
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0b0d] text-foreground relative overflow-hidden font-sans p-4">
        {/* Premium ambient decorative glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse duration-[6000ms]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>

        {/* Main card */}
        <div className="w-full max-w-md bg-card/45 border border-border backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col p-8 z-10 animate-in fade-in duration-500 scale-in duration-300">
        
        {/* Logo and Branding header */}
        <header className="flex flex-col items-center mb-8">
          <img 
            src={logo} 
            alt="Urbanis Logo" 
            className="h-16 w-auto object-contain brightness-110 mb-4 animate-in slide-in-from-top duration-700" 
          />
          <div className="h-0.5 w-12 bg-primary rounded-full mb-3" />
          <h1 className="text-xl font-heading font-bold text-foreground tracking-tight text-center">
            {isSignUp ? "Criar Conta de Consultor" : "Acesso à Plataforma"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 text-center max-w-[280px]">
            {isSignUp 
              ? "Cadastre suas credenciais para gerenciar seus estudos na nuvem" 
              : "Faça login com sua conta segura para acessar seu painel de geomarketing"}
          </p>
        </header>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Error alert */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">E-mail Corporativo</label>
            <div className="relative">
              <input 
                type="email"
                required
                placeholder="consultor@urbanis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full h-11 pl-10 pr-3.5 bg-background/50 border border-border/80 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 transition-fast"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Senha de Acesso</label>
            <div className="relative">
              <input 
                type="password"
                required
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full h-11 pl-10 pr-3.5 bg-background/50 border border-border/80 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 transition-fast"
              />
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Submit button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:brightness-110 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-fast active:scale-[0.98] shadow-lg shadow-primary/20 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isSignUp ? "Criar Minha Conta" : "Entrar com Segurança"}</span>
              </>
            )}
          </button>
        </form>

        {/* Separator / Mode toggle */}
        <footer className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-4">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground transition-fast font-medium"
          >
            {isSignUp 
              ? "Já possui uma credencial de acesso? Faça Login" 
              : "Não possui cadastro? Criar nova conta de consultor"}
          </button>

          {/* Offline localstorage fallback */}
          <div className="w-full flex items-center justify-between text-xs text-muted-foreground mt-2 bg-muted/20 border border-border/40 rounded-lg p-3">
            <span className="font-medium text-[10px] font-mono uppercase tracking-wide">Ambiente Local / Testes</span>
            <button 
              onClick={() => setOfflineMode(true)}
              disabled={loading}
              className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-fast"
              title="Acessar base local sem salvar na nuvem"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Modo Convidado</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  </div>
  );
}
