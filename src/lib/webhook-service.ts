import { SecurityAlert } from "./sentinel-store";

export interface WebhookConfig {
  url: string;
  enabled: boolean;
}

let config: WebhookConfig = {
  url: "https://api.z-api.io/instances/3F5B912DACB491A9FE485648EE7461AA/token/7581E090538C4B112DB34407/send-text",
  enabled: true,
};

let pendingAlerts: SecurityAlert[] = [];
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

export const setWebhookConfig = (newConfig: WebhookConfig) => {
  config = newConfig;
};

const dispatchWebhook = async () => {
  if (!config.enabled || pendingAlerts.length === 0) return;

  const alertsToSend = [...pendingAlerts];
  pendingAlerts = [];
  debounceTimeout = null;

  try {
    const userIds = Array.from(new Set(alertsToSend.map(a => a.userId)));

    let message = `🚨 *Alerta Crítico do Sentinel* 🚨\n\n`;
    message += `Detectamos ${alertsToSend.length} alertas em um curto período.\n`;

    if (userIds.length === 1) {
      message += `\n👤 *Usuário Afetado ID:* ${userIds[0]}`;
    } else {
      message += `\n👥 *Múltiplos Usuários:* ${userIds.length} contas afetadas`;
    }

    message += `\n\n*Resumo das últimas atividades:*`;
    alertsToSend.slice(-3).forEach(alert => {
      message += `\n- ${alert.summary} (Risco: ${alert.score}%)`;
    });

    if (alertsToSend.length > 3) {
      message += `\n...e mais ${alertsToSend.length - 3} alertas.`;
    }

    message += `\n\n⚠️ Acesse o console do Sentinel para aprovar ou negar solicitações de liberação.`;

    await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "5581988064314", message }),
    });
  } catch (error) {
    console.error(error);
  }
};

export const enqueueNotification = (alert: SecurityAlert) => {
  pendingAlerts.push(alert);
  if (!debounceTimeout) {
    debounceTimeout = setTimeout(dispatchWebhook, 5000);
  }
};
