import {
  hashAccq002,
  runAccq002MinimalSlice,
  type TwoCivilizationSliceResult,
} from "../artificial-civilization/two-civilization-minimal-slice.js"

export const GAMERLASTONE_APERTURE_SCHEMA = "GLS-APERTURE-001-v0.1" as const

export interface ApertureCard {
  heading: string
  body: string
}

export interface GamerLaStoneAperture {
  schema: typeof GAMERLASTONE_APERTURE_SCHEMA
  sourceSimulationHash: string
  title: string
  subtitle: string
  cards: ApertureCard[]
  causalStatement: string
  boundaryStatement: string
  witnessPrompt: string
  witnessStatus: "AWAITING_HUMAN_WITNESS"
}

export function buildGamerLaStoneAperture(
  result: TwoCivilizationSliceResult,
): GamerLaStoneAperture {
  const source = result.civilizationA.committedHistory[0]
  const response = result.civilizationB.committedHistory[0]

  if (!source || !response) {
    throw new Error("ACCQ-002 history incomplete")
  }

  return {
    schema: GAMERLASTONE_APERTURE_SCHEMA,
    sourceSimulationHash: hashAccq002(result),
    title: "A consequence crossed without the civilizations touching",
    subtitle: "One civilization changed locally after receiving a bounded influence from another civilization's committed history.",
    cards: [
      {
        heading: "1 — What happened in Civilization A?",
        body: "Civilization A experienced and committed a local ecology consequence before anything left its world.",
      },
      {
        heading: "2 — What crossed?",
        body: "A bounded ecology warning crossed as influence only. No Citizen, object, resource, or ordinary matter crossed between civilizations.",
      },
      {
        heading: "3 — How did it travel?",
        body: "The committed consequence moved outward through the Living World / Environmental Heart, crossed NaShaTa, circulated through Underflow, then reached the receiving side through NaShaTa.",
      },
      {
        heading: "4 — What happened in Civilization B?",
        body: "Civilization B admitted the influence as eligibility input, then authored its own local carrying-capacity review. The sending civilization did not choose the receiving civilization's response.",
      },
      {
        heading: "5 — What connects the histories?",
        body: `The receiving history explicitly points back to the originating committed history: ${source.id} → ${result.packet.packetId} → ${response.id}.`,
      },
    ],
    causalStatement: "Civilization B changed because a consequence from Civilization A became locally relevant after a lawful cross-realm route; Civilization A did not directly mutate Civilization B.",
    boundaryStatement: "Simulation truth is established by ACCQ-002. Human encounter is not established until a person actually reads this aperture and reports what they understood.",
    witnessPrompt: "After reading this, can you tell that Civilization B's change was caused by an influence originating in Civilization A, even though the civilizations never physically touched?",
    witnessStatus: "AWAITING_HUMAN_WITNESS",
  }
}
export function renderApertureMarkdown(aperture: GamerLaStoneAperture): string {
  const cards = aperture.cards
    .map(card => `## ${card.heading}\n\n${card.body}`)
    .join("\n\n")

  return [
    `# ${aperture.title}`,
    aperture.subtitle,
    cards,
    `## Causal reading\n\n${aperture.causalStatement}`,
    `## Boundary\n\n${aperture.boundaryStatement}`,
    `## Human witness question\n\n${aperture.witnessPrompt}`,
    `Witness status: ${aperture.witnessStatus}`,
  ].join("\n\n")
}

export function createApertureTrialFixture(): {
  beforeHash: string
  afterHash: string
  aperture: GamerLaStoneAperture
  markdown: string
} {
  const simulation = runAccq002MinimalSlice()
  const beforeHash = hashAccq002(simulation)
  const aperture = buildGamerLaStoneAperture(simulation)
  const markdown = renderApertureMarkdown(aperture)
  const afterHash = hashAccq002(simulation)
  return { beforeHash, afterHash, aperture, markdown }
}
