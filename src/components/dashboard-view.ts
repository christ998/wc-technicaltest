import './cards-container';
import './user-card';
import './error-card';
import './loading-spinner';
import './popularity-card';
import { SearchInput } from './search-input';
import { UserAdapter } from '../adapters/userAdapter';
import type { ErrorCard } from './error-card';
import type { UserCard } from './user-card';

export class DashboardView extends HTMLElement {
  private state: 'idle' | 'loading' | 'error' | 'success' = 'idle';
  private payload: any = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.addEvents();
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        .content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
        }
      </style>
      <div class="content">
        <search-input id="finder"></search-input>
        <cards-container id="cardsContainer"></cards-container>
      </div>
    `;

    this.updateUI();
  }

  updateUI() {
    const container = this.shadowRoot!.querySelector('#cardsContainer')!;
    container.innerHTML = '';    
    if (this.state === 'loading') {
      container.innerHTML = `<loading-spinner></loading-spinner>`;
    }
    if (this.state === 'error') {
      const errorCard = document.createElement('error-card') as ErrorCard;
      errorCard.error = this.payload;
      container.appendChild(errorCard);
    }
    if (this.state === 'success') {
      const userCard = document.createElement('user-card') as UserCard;
      userCard.data = this.payload;
      container.appendChild(userCard);
      
      const popularityCard = document.createElement('popularity-card');
      (popularityCard as any).data = this.payload;
      container.appendChild(popularityCard);
    }
  }

  addEvents() {
    const finder = this.shadowRoot!.querySelector<SearchInput>('#finder');
    if (!finder) return;
    
    finder.addEventListener('loading', (event: Event) => {
      if (event instanceof CustomEvent && event.detail === true) {
        this.state = 'loading';
        this.payload = null;
        this.updateUI();
      }
    });
    
    finder.addEventListener('error', (event: Event) => {
      if (event instanceof CustomEvent) {
        this.state = 'error';
        this.payload = event.detail;
        this.updateUI();
      }
    });
    
    this.addEventListener('user-info', (event: Event) => {
      if (event instanceof CustomEvent) {
        this.state = 'success';
        this.payload = UserAdapter.convert(event.detail);
        this.updateUI();
      }
    });
  }
}

if (!customElements.get('dashboard-view')) {
  customElements.define('dashboard-view', DashboardView);
}
