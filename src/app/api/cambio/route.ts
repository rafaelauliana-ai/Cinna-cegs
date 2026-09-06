import { NextResponse } from "next/server";
import { USD_MARKUP_BRL } from "@/lib/config";

// Cotação do Dólar (USD -> BRL) do dia, usando a AwesomeAPI (gratuita, sem
// necessidade de chave). Cacheada por 1h no servidor pra não bater na API
// externa a cada carregamento de página.
const SOURCE_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL";

export async function GET() {
  try {
    const response = await fetch(SOURCE_URL, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error("Falha ao consultar a cotação.");

    const data = await response.json();
    const bid = Number(data?.USDBRL?.bid);

    if (!Number.isFinite(bid)) throw new Error("Cotação inválida.");

    return NextResponse.json({
      rate: bid,
      markup: USD_MARKUP_BRL,
      updatedAt: data.USDBRL.create_date ?? new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível obter a cotação do dólar agora. Tente novamente em instantes." },
      { status: 502 },
    );
  }
}
