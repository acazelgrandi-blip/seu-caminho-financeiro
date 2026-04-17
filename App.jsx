import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SCALE_FREQUENCY = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];
const SCALE_KNOWLEDGE = ["Sim, com segurança", "Mais ou menos", "Não"];
const SCALE_AGREE = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];
const SCALE_YESNO = ["Sim", "Não"];
const SCALE_0_10 = Array.from({ length: 11 }, (_, i) => String(i));

const DIFF_OPTIONS = [
  "Falta de renda suficiente",
  "Gastos inesperados",
  "Dificuldade em controlar os gastos",
  "Compras por impulso",
  "Uso frequente de crédito",
  "Falta de planejamento financeiro",
  "Não saber por onde começar",
  "Ansiedade ou preocupação com dinheiro",
  "Falta de disciplina",
  "Desorganização",
  "Ajuda financeira a outras pessoas",
  "Outro",
];

const FLOW = [
  { type: "name" },
  {
    type: "intro",
    title: "Seu Caminho Financeiro",
    text: "Esse é um momento para você olhar para a sua vida financeira com mais clareza.",
    emoji: "✨",
  },
  {
    type: "message",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    text: "Aqui não é sobre números — é sobre como você se sente.\nComeçaremos com algo simples: sua realidade hoje.\nVamos começar olhando para o presente, com honestidade e sem julgamento.",
  },
  { q: 1, text: "Consigo pagar todas as minhas contas dentro do prazo no mês", scale: "freq" },
  { q: 2, text: "Atrasei o pagamento de alguma conta nos últimos 3 meses", scale: "yesno", invert: true },
  { q: 3, text: "Atualmente possuo dívidas em aberto (cartão, empréstimo ou financiamento)", scale: "yesno", invert: true },
  { q: 4, text: "Possuo algum valor guardado para emergências", scale: "yesno" },
  { q: 5, text: "Minha renda atual é suficiente para cobrir minhas despesas mensais", scale: "agree" },
  {
    type: "message",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
    text: "Entender como o dinheiro funciona é um passo importante.",
  },
  { q: 6, text: "Entendo como os juros do cartão de crédito são calculados", scale: "know" },
  { q: 7, text: "Sei identificar quanto pago de juros nas minhas dívidas", scale: "know" },
  { q: 8, text: "Sei como montar e organizar um orçamento mensal", scale: "know" },
  { q: 9, text: "Entendo a diferença entre gastar, poupar e investir", scale: "know" },
  { q: 10, text: "Sei planejar meus gastos antes de utilizar meu dinheiro", scale: "know" },
  {
    type: "message",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    text: "Agora vamos olhar para o que você faz no dia a dia.",
  },
  { q: 11, text: "Registro ou acompanho meus gastos regularmente", scale: "freq" },
  { q: 12, text: "Faço compras por impulso, sem planejamento prévio", scale: "freq", invert: true },
  { q: 13, text: "Uso cartão de crédito ou outro tipo de crédito para pagar despesas básicas (como alimentação, contas ou transporte)", scale: "freq", invert: true },
  { q: 14, text: "Planejo meus gastos antes de realizar compras", scale: "freq" },
  { q: 15, text: "Consigo evitar gastos que não são necessários", scale: "freq" },
  {
    type: "message",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
    text: "Aqui não é sobre números — é sobre como você se sente.",
  },
  { q: 16, text: "Penso com frequência em preocupações relacionadas ao dinheiro", scale: "freq", invert: true },
  { q: 17, text: "Sinto que não tenho controle sobre minha vida financeira", scale: "agree", invert: true },
  { q: 18, text: "Me considero uma pessoa organizada com o meu dinheiro", scale: "agree" },
  { q: 19, text: "Acredito que sou capaz de melhorar minha situação financeira", scale: "agree" },
  { q: 20, text: "Sinto que minha situação financeira atual me traz segurança", scale: "agree" },
  {
    type: "message",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop",
    text: "Até aqui, você respondeu sobre sua realidade e seus comportamentos.\nAgora queremos entender como você se percebe nesse processo.\nNão é sobre certo ou errado — é sobre o seu momento.",
  },
  { q: 21, text: "Você já tentou se organizar financeiramente antes?", scale: "yesno" },
  { q: 22, text: "O que mais dificulta sua organização financeira hoje?", scale: "multi" },
  { q: 23, text: "Se quiser, descreva com suas palavras o que mais dificulta sua organização financeira", scale: "text" },
  { q: 24, text: "De 0 a 10, quanto você acredita que é capaz de melhorar sua vida financeira a partir de agora?", scale: "0-10" },
  { type: "result" },
];

function getScaleOptions(scale) {
  if (scale === "freq") return SCALE_FREQUENCY;
  if (scale === "know") return SCALE_KNOWLEDGE;
  if (scale === "agree") return SCALE_AGREE;
  if (scale === "yesno") return SCALE_YESNO;
  if (scale === "0-10") return SCALE_0_10;
  return [];
}

function normalizeValue(item, value) {
  if (value === undefined || value === null) return 0;
  let val = value;
  if (item.scale === "yesno") val = value === 0 ? 4 : 0;
  if (item.scale === "know") val = value === 0 ? 4 : value === 1 ? 2 : 0;
  if (item.invert) val = 4 - val;
  return val;
}

function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`option-button ${active ? "option-active" : ""}`}
    >
      {children}
    </button>
  );
}

function GlassCard({ children }) {
  return (
    <div className="glass-card">
      <div className="glass-top" />
      <div className="glass-body">{children}</div>
    </div>
  );
}

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState({});
  const [multi, setMulti] = useState([]);
  const [text23, setText23] = useState("");

  const step = FLOW[stepIndex];
  const progress = Math.round((stepIndex / (FLOW.length - 1)) * 100);

  const choose = (questionNumber, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: optionIndex }));
  };

  const toggleMulti = (option) => {
    setMulti((prev) =>
      prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option]
    );
  };

  const score = useMemo(() => {
    let total = 0;
    for (let q = 1; q <= 20; q += 1) {
      const item = FLOW.find((x) => x.q === q);
      total += normalizeValue(item, answers[q]);
    }
    return total;
  }, [answers]);

  const profile = useMemo(() => {
    if (score <= 35) return "Perfil Impulsivo";
    if (score <= 50) return "Perfil em Evitação";
    if (score <= 65) return "Perfil em Desenvolvimento";
    return "Perfil Organizado";
  }, [score]);

  const predominantCause = useMemo(() => {
    if (multi.includes("Ansiedade ou preocupação com dinheiro")) return "emocional";
    if (multi.includes("Compras por impulso")) return "comportamental";
    if (multi.includes("Falta de renda suficiente")) return "estrutural";
    if (multi.includes("Não saber por onde começar")) return "cognitivo";
    return "mista";
  }, [multi]);

  const resultText = useMemo(() => {
    const profiles = {
      "Perfil Impulsivo": "Você tende a tomar decisões no momento, muitas vezes sem planejamento. Isso não significa falta de capacidade. Significa apenas que hoje suas escolhas podem estar acontecendo mais no impulso do que na pausa.",
      "Perfil em Evitação": "Existe um afastamento do tema financeiro. Em muitos casos, isso vem do desconforto, da insegurança ou até do cansaço. E isso é mais comum do que parece.",
      "Perfil em Desenvolvimento": "Você já tem consciência, já percebe pontos importantes e já mostra sinais de construção. O que falta aqui não é vontade, mas consistência.",
      "Perfil Organizado": "Você já apresenta uma base mais consolidada na sua vida financeira. Isso indica planejamento, maior percepção e uma relação mais estruturada com suas decisões.",
    };

    const causes = {
      emocional: "O que aparece com mais força nas suas respostas está ligado ao emocional. Isso mostra que o dinheiro, para você, envolve sentimentos, tensão ou preocupação — e isso precisa ser acolhido, não ignorado.",
      comportamental: "O ponto mais evidente está no comportamento do dia a dia. Pequenas mudanças na rotina e nas decisões podem gerar transformações muito relevantes ao longo do tempo.",
      estrutural: "Sua realidade concreta tem um peso importante nas suas decisões. Isso significa que qualquer avanço precisa respeitar seu contexto e suas condições reais.",
      cognitivo: "Existe uma sensação de não saber por onde começar. Isso não é falta de capacidade. É falta de clareza de caminho — e isso pode ser construído.",
      mista: "Seu resultado sugere que diferentes fatores estão atuando ao mesmo tempo. Por isso, o melhor caminho é olhar para sua vida financeira de forma integrada.",
    };

    const directions = {
      "Perfil Impulsivo": "O primeiro passo para você não é rigidez. É consciência. Aprender a pausar antes de decidir já pode abrir um caminho novo.",
      "Perfil em Evitação": "Seu movimento inicial não precisa ser grande. Aproximação já é avanço. O importante é não se afastar de si mesma nesse processo.",
      "Perfil em Desenvolvimento": "Você está em um ponto muito promissor. Com estrutura, direção e prática, essa construção tende a ganhar força.",
      "Perfil Organizado": "Seu próximo passo não é começar do zero. É ampliar horizontes, refinar estratégias e se aventurar no mundo financeiro com mais profundidade.",
    };

    return `${profiles[profile]}\n\n${causes[predominantCause]}\n\n${directions[profile]}`;
  }, [profile, predominantCause]);

  const canAdvance = useMemo(() => {
    if (step.type === "name") return name.trim().length > 0;
    if (step.type === "intro" || step.type === "message" || step.type === "result") return true;
    if (step.scale === "multi") return multi.length > 0;
    if (step.scale === "text") return true;
    return answers[step.q] !== undefined;
  }, [step, name, answers, multi]);

  const next = () => setStepIndex((prev) => Math.min(FLOW.length - 1, prev + 1));
  const prev = () => setStepIndex((prev) => Math.max(0, prev - 1));

  return (
    <div
      className="page"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop')",
      }}
    >
      <div className="overlay">
        <div className="container">
          <div className="progress-shell">
            <div className="progress-head">
              <span>Você está indo bem</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              transition={{ duration: 0.28 }}
            >
              <GlassCard>
                {step.type === "name" && (
                  <div className="stack-lg">
                    <div className="emoji">🌿</div>
                    <h2 className="title">Antes de começar</h2>
                    <p className="muted">Como podemos te chamar?</p>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite seu nome"
                      className="text-input"
                    />
                  </div>
                )}

                {step.type === "intro" && (
                  <div className="stack-lg center">
                    <img
                      src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop"
                      alt="Natureza acolhedora"
                      className="hero-image"
                    />
                    <div className="emoji">{step.emoji || "✨"}</div>
                    <h2 className="title">{step.title}</h2>
                    <p className="body-text">{step.text}</p>
                  </div>
                )}

                {step.type === "message" && (
                  <div className="stack-lg">
                    {step.image && <img src={step.image} alt="Ambiente acolhedor" className="section-image" />}
                    <div className="pill">Siga no seu ritmo</div>
                    <p className="body-text body-left">{step.text}</p>
                  </div>
                )}

                {step.q && step.scale !== "multi" && step.scale !== "text" && (
                  <div className="stack-lg">
                    <p className="question-text">{step.text}</p>
                    <div className="stack-sm">
                      {getScaleOptions(step.scale).map((option, idx) => (
                        <OptionButton
                          key={idx}
                          active={answers[step.q] === idx}
                          onClick={() => choose(step.q, idx)}
                        >
                          {option}
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                )}

                {step.scale === "multi" && (
                  <div className="stack-lg">
                    <p className="question-text">{step.text}</p>
                    <p className="small-muted">Você pode marcar mais de uma opção.</p>
                    <div className="stack-sm">
                      {DIFF_OPTIONS.map((option, idx) => (
                        <OptionButton key={idx} active={multi.includes(option)} onClick={() => toggleMulti(option)}>
                          {option}
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                )}

                {step.scale === "text" && (
                  <div className="stack-lg">
                    <p className="question-text">{step.text}</p>
                    <p className="small-muted">Se fizer sentido para você, descreva com suas palavras…</p>
                    <textarea
                      value={text23}
                      onChange={(e) => setText23(e.target.value)}
                      className="textarea-input"
                      placeholder="Escreva aqui..."
                    />
                  </div>
                )}

                {step.type === "result" && (
                  <div className="stack-lg center">
                    <img
                      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
                      alt="Horizonte e expansão"
                      className="hero-image"
                    />
                    <div className="emoji">🌟</div>
                    <h2 className="title">{name}, esse é o seu momento</h2>
                    <div className="result-box">{resultText}</div>
                    <p className="body-text">
                      A partir daqui, você pode ampliar seus horizontes e se aventurar no mundo financeiro respeitando suas características e sua identidade.
                    </p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <div className="nav-row">
            <button
              type="button"
              onClick={prev}
              disabled={stepIndex === 0}
              className={`nav-button ${stepIndex === 0 ? "nav-disabled" : "nav-secondary"}`}
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance || step.type === "result"}
              className={`nav-button ${!canAdvance || step.type === "result" ? "nav-disabled" : "nav-primary"}`}
            >
              {step.type === "result" ? "Concluído" : "Avançar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
