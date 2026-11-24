import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare setState: (state: Partial<State> | ((prevState: State) => Partial<State>)) => void;
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('STEM ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl border border-destructive/30 bg-card p-6 sm:p-8 shadow-xl text-center space-y-5">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/25">
              <AlertCircle className="size-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Kutilmagan xatolik yuz berdi
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Ilova render jarayonida uzilish kuzatildi. Iltimos, sahifani qayta yuklang yoki bosh sahifaga o‘ting.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-xl bg-muted/60 p-3 text-left overflow-auto max-h-32 text-[11px] font-mono text-muted-foreground border border-border">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
              >
                <RotateCcw className="size-4" />
                <span>Sahifani yangilash</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
              >
                <Home className="size-4" />
                <span>Bosh sahifa</span>
              </button>
            </div>

            <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <Sparkles className="size-3.5 text-accent" />
              <span>STEM-Simulations Ekotizimi</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
