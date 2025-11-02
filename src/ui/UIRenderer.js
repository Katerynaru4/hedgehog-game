export class UIRenderer {
  constructor() {
    this.elements = {
      state: document.getElementById('state'),
      energy: document.getElementById('energy'),
      score: document.getElementById('score'),
      time: document.getElementById('time'),
      log: document.getElementById('log'),
    };
  }

  render(gameState) {
    this.updateInfo(gameState);
  }

  updateInfo(gameState) {
    const { hedgehog, timeRemaining } = gameState;

    if (this.elements.state) {
      const stateEmojis = {
        Normal: '🦔',
        Curled: '🔵',
        Dead: '💀',
      };
      this.elements.state.textContent = `${stateEmojis[hedgehog.state] || ''} ${
        hedgehog.state
      }`;
    }

    if (this.elements.energy) {
      this.elements.energy.textContent = hedgehog.energy;
    }

    if (this.elements.score) {
      this.elements.score.textContent = hedgehog.score;
    }

    if (this.elements.time) {
      this.elements.time.textContent = timeRemaining;
    }
  }

  addLog(message, type = 'info') {
    if (!this.elements.log) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${timestamp}] ${message}`;

    this.elements.log.appendChild(entry);
    this.elements.log.scrollTop = this.elements.log.scrollHeight;
  }

  clearLog() {
    if (this.elements.log) {
      this.elements.log.innerHTML = '';
    }
  }

  disableButtons(buttons) {
    buttons.forEach((button) => {
      if (button) {
        button.disabled = true;
      }
    });
  }

  enableButtons(buttons) {
    buttons.forEach((button) => {
      if (button) {
        button.disabled = false;
      }
    });
  }
}
