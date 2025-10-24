import './app-card';
import type { User } from '../types/types';

export class PopularityCard extends HTMLElement {
  user?: User | null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(user: User | undefined) {
    this.user = user;
    this.render();
  }

  private getPopularityLevel(): { level: string; color: string } {
    if (!this.user) return { level: 'Desconocido', color: '#999' };

    const followers = this.user.followers;

    if (followers >= 1000) return { level: 'Muy Popular', color: '#4ade80' };
    if (followers >= 500) return { level: 'Popular', color: '#60a5fa' };
    if (followers >= 100) return { level: 'Conocido', color: '#fbbf24' };
    if (followers >= 10) return { level: 'Emergente', color: '#fb923c' };
    return { level: 'Nuevo', color: '#94a3b8' };
  }

  private getBalanceScore(): { score: string; description: string; color: string } {
    if (!this.user) return { score: '-', description: 'Sin datos', color: '#999' };
    
    const { followers, publicRepos } = this.user;
    
    if (publicRepos === 0) {
      return { score: 'N/A', description: 'Sin repositorios', color: '#94a3b8' };
    }
    
    const ratio = followers / publicRepos;
    
    if (ratio >= 10) return { score: 'Excelente', description: 'Alto impacto', color: '#4ade80' };
    if (ratio >= 5) return { score: 'Muy Bueno', description: 'Gran alcance', color: '#60a5fa' };
    if (ratio >= 2) return { score: 'Bueno', description: 'Buen equilibrio', color: '#fbbf24' };
    if (ratio >= 0.5) return { score: 'Moderado', description: 'En desarrollo', color: '#fb923c' };
    return { score: 'Bajo', description: 'Perfil técnico', color: '#94a3b8' };
  }

  private getActivityStatus(): { status: string; color: string } {
    if (!this.user) return { status: 'Desconocido', color: '#999' };

    const lastUpdate = new Date(this.user.updatedAt);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate <= 7) return { status: 'Muy Activo', color: '#4ade80' };
    if (daysSinceUpdate <= 30) return { status: 'Activo', color: '#60a5fa' };
    if (daysSinceUpdate <= 90) return { status: 'Moderado', color: '#fbbf24' };
    if (daysSinceUpdate <= 180) return { status: 'Poco Activo', color: '#fb923c' };
    return { status: 'Inactivo', color: '#94a3b8' };
  }

  private formatLastUpdate(): string {
    if (!this.user) return '-';
    
    const lastUpdate = new Date(this.user.updatedAt);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceUpdate === 0) return 'Hoy';
    if (daysSinceUpdate === 1) return 'Ayer';
    if (daysSinceUpdate < 7) return `Hace ${daysSinceUpdate} días`;
    if (daysSinceUpdate < 30) return `Hace ${Math.floor(daysSinceUpdate / 7)} semanas`;
    if (daysSinceUpdate < 365) return `Hace ${Math.floor(daysSinceUpdate / 30)} meses`;
    return `Hace ${Math.floor(daysSinceUpdate / 365)} años`;
  }

  render() {
    if (!this.shadowRoot || !this.user) {
      this.shadowRoot!.innerHTML = '';
      return;
    }

    const popularity = this.getPopularityLevel();
    const balance = this.getBalanceScore();
    const activity = this.getActivityStatus();
    const lastUpdate = this.formatLastUpdate();

    this.shadowRoot.innerHTML = `
      <style>
        .metrics-container {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          padding: 1rem;
          width: 100%;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 0.5rem;
          border-left: 4px solid var(--metric-color);
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-accent-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-emoji {
          font-size: 1rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--metric-color);
          line-height: 1;
        }

        .metric-description {
          font-size: 0.85rem;
          color: var(--color-light);
          opacity: 0.9;
        }

        .metric-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--color-accent-dark);
          margin-top: 0.25rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .metric-stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-label {
          opacity: 0.7;
        }

        .stat-value {
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .metrics-container {
            gap: 0.8rem;
          }
          
          .metric {
            padding: 0.75rem;
          }
        }
      </style>
      <app-card title="Indicadores de Popularidad">
        <div slot="content" class="metrics-container">
          <div class="metric" style="--metric-color: ${popularity.color}">
            <div class="metric-header">
              <span>Popularidad</span>
            </div>
            <div class="metric-value">${popularity.level}</div>
            <div class="metric-description">
              Basado en la cantidad de seguidores
            </div>
            <div class="metric-details">
              <div class="metric-stat">
                <span class="stat-label">Seguidores:</span>
                <span class="stat-value">${this.user.followers.toLocaleString()}</span>
              </div>
              <div class="metric-stat">
                <span class="stat-label">Siguiendo:</span>
                <span class="stat-value">${this.user.following.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="metric" style="--metric-color: ${balance.color}">
            <div class="metric-header">
              <span>Equilibrio</span>
            </div>
            <div class="metric-value">${balance.score}</div>
            <div class="metric-description">
              ${balance.description} (${this.user.followers} seguidores / ${this.user.publicRepos} repos)
            </div>
            <div class="metric-details">
              <div class="metric-stat">
                <span class="stat-label">Ratio:</span>
                <span class="stat-value">${(this.user.followers / (this.user.publicRepos || 1)).toFixed(1)}</span>
              </div>
              <div class="metric-stat">
                <span class="stat-label">Repos:</span>
                <span class="stat-value">${this.user.publicRepos}</span>
              </div>
            </div>
          </div>

          <div class="metric" style="--metric-color: ${activity.color}">
            <div class="metric-header">
              <span>Actividad Reciente</span>
            </div>
            <div class="metric-value">${activity.status}</div>
            <div class="metric-description">
              Última actualización: ${lastUpdate}
            </div>
            <div class="metric-details">
              <div class="metric-stat">
                <span class="stat-label">Actualizado:</span>
                <span class="stat-value">${new Date(this.user.updatedAt).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>
        </div>
      </app-card>
    `;
  }
}

if (!customElements.get('popularity-card')) {
  customElements.define('popularity-card', PopularityCard);
}