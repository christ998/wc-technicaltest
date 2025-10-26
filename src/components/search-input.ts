import { config } from '../config/env';

export class SearchInput extends HTMLElement {
  private input!: HTMLInputElement;
  private button!: HTMLButtonElement;
  private timer?: ReturnType<typeof setTimeout>;
  private controller?: AbortController;
  private isLoading: boolean = false;

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
        .search-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        input {
          border: 2px solid var(--color-accent-dark);
          border-radius: 0.25rem;
          padding: 0.5rem;
          width: 20rem;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: #f3f4f6;
        }

        button {
          background: var(--color-accent-dark);
          color: var(--color-white);
          border: none;
          border-radius: 0.25rem;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        button:hover:not(:disabled) {
          background: var(--color-accent);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: var(--color-accent-dark);
        }

        button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .search-container {
            flex-direction: column;
            width: 100%;
          }

          input {
            width: 100%;
          }

          button {
            width: 100%;
          }
        }
      </style>
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Escribe un nombre de usuario"
          aria-label="Nombre de usuario de GitHub"
          autocomplete="off"
        />
        <button 
          type="button"
          aria-label="Buscar usuario"
        >
          <span class="button-text">Buscar</span>
        </button>
      </div>
    `;
    this.input = this.shadowRoot!.querySelector('input')!;
    this.button = this.shadowRoot!.querySelector('button')!;
  }

  addEvents() {
    this.input.addEventListener('input', () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        const userId = this.input.value.trim();
        if (userId) {
          this.fetchUser(userId);
        }
      }, 500);
    });

    this.button.addEventListener('click', () => {
      const userId = this.input.value.trim();
      if (userId) {
        clearTimeout(this.timer);
        this.fetchUser(userId);
      }
    });

  }

  private updateButtonState() {
    const buttonText = this.button.querySelector('.button-text');
    
    if (this.isLoading) {
      this.button.disabled = true;
      this.input.disabled = true;
      
      if (buttonText) {
        buttonText.innerHTML = `<span class="spinner"></span>`;
      }
      
      this.button.setAttribute('aria-busy', 'true');
    } else {
      this.button.disabled = false;
      this.input.disabled = false;
      
      if (buttonText) {
        buttonText.textContent = 'Buscar';
      }
      
      this.button.setAttribute('aria-busy', 'false');
      
      // Devolver el foco al input después de la búsqueda
      this.input.focus();
    }
  }

  fetchUser(userId: string) {
    this.controller?.abort();
    this.controller = new AbortController();
    this.isLoading = true;
    this.updateButtonState();
    
    this.dispatchEvent(
      new CustomEvent('loading', { detail: true, bubbles: true, composed: true })
    );
    
    fetch(`${config.apiUrl}/users/${userId}`, { signal: this.controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Usuario no encontrado');
        return res.json();
      })
      .then((detail) => {
        this.dispatchEvent(
          new CustomEvent('user-info', { detail, bubbles: true, composed: true })
        );
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        this.dispatchEvent(
          new CustomEvent('error', { detail: err.message, bubbles: true, composed: true })
        );
      })
      .finally(() => {
        this.isLoading = false;
        this.updateButtonState();
        
        this.dispatchEvent(
          new CustomEvent('loading', { detail: false, bubbles: true, composed: true })
        );
      });
  }

}

customElements.define('search-input', SearchInput);
