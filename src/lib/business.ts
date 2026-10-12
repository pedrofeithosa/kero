/**
 * Kero Mais — dados de contato do negócio (fonte única).
 * Footer, página de contato, botão de WhatsApp e dados estruturados (SEO) leem daqui.
 * Para mudar endereço ou telefone, altere somente este arquivo.
 */
export const BUSINESS = {
  name: "Kero Mais",
  address: {
    street: "Rua Sérgio Coser, 269",
    district: "Jardim Marajoara",
    city: "Pedreira",
    state: "SP",
    country: "BR",
  },
  /** Como aparece para o cliente */
  phoneDisplay: "(19) 99673-8756",
  /** Para links tel: e dados estruturados */
  phoneE164: "+5519996738756",
  phoneSchema: "+55-19-99673-8756",
  /** Coordenadas da loja (tiradas do mapa do Google), usadas nos dados estruturados */
  geo: { latitude: -22.7157191, longitude: -46.8959011 },
  /** Número do WhatsApp só com dígitos (DDI + DDD + número) */
  whatsappNumber: "5519996738756",
} as const;

/**
 * Perfil da empresa no Google (Perfil da Empresa / Google Maps).
 * Quando preencher, o mapa passa a mostrar a Kero Mais (com nome, fotos e avaliações)
 * e "Como chegar" abre direto o perfil. Vazio = usa só o endereço.
 *  - placeUrl: no Google Maps, abra a Kero Mais > Compartilhar > Copiar link
 *  - embedSrc: Compartilhar > Incorporar um mapa > copie só o endereço que está em src="..."
 */
export const GOOGLE_PROFILE: { placeUrl: string; embedSrc: string } = {
  placeUrl: "https://maps.app.goo.gl/bbbXAh2TRvucE8WT9",
  embedSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.3368166103237!2d-46.895901120654294!3d-22.71571909999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8df610e294fbd%3A0xdc4a1e95fa854c90!2sLanchonete%20Kero%20Mais!5e0!3m2!1spt-BR!2sbr!4v1791843529885!5m2!1spt-BR!2sbr",
};

const { street, district, city, state } = BUSINESS.address;

/** Endereço em uma linha, para exibir no site */
export const ADDRESS_LINE = `${street} — ${district}, ${city}/${state}`;

/** Texto usado pelo Google Maps para localizar o endereço */
const MAPS_QUERY = `${street}, ${district}, ${city} - ${state}, Brasil`;

/** Mapa incorporado (sem chave de API) */
export const MAPS_EMBED_URL =
  GOOGLE_PROFILE.embedSrc ||
  `https://www.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&output=embed`;

/** "Como chegar": abre o perfil da loja no Google Maps (ou a rota pelo endereço, se não houver perfil) */
export const MAPS_DIRECTIONS_URL =
  GOOGLE_PROFILE.placeUrl ||
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAPS_QUERY)}`;

export const TEL_URL = `tel:${BUSINESS.phoneE164}`;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${BUSINESS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
