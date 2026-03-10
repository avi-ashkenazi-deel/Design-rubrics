// Maps discipline names to the set of emails that have access.
// Users not listed in any discipline can see ALL disciplines (admin/unrestricted).
const DESIGN_EMAILS: string[] = [
  'aaron.watkins@deel.com',
  'alejandro.navarrete@deel.com',
  'aleksandr.loviagin@deel.com',
  'alessandra.zacco@deel.com',
  'alex.brooke@deel.com',
  'amanda.maia@deel.com',
  'andra.cimpan@deel.com',
  'andrea.canelo@deel.com',
  'andrew.litnytskyi@deel.com',
  'ariel.gartner@deel.com',
  'avi.ashkenazi@deel.com',
  'belen.blanquer@deel.com',
  'belen.nunez@deel.com',
  'bogdan.popescu@deel.com',
  'boryana.krizhanovska@deel.com',
  'caio.rodrigues@deel.com',
  'carlos.wydler@deel.com',
  'christina.reck@deel.com',
  'cristian.arevalo@deel.com',
  'daria.martyniuk@deel.com',
  'davi.nabarro@deel.com',
  'david.bullock@deel.com',
  'davide.montesano@deel.com',
  'eduardo.insaurriaga@deel.com',
  'eric.kabisch@deel.com',
  'eric.muller@deel.com',
  'erica.atanasoff@deel.com',
  'fabrizia.ausiello@deel.com',
  'fernanda.magalhaes@deel.com',
  'gav.elliott@deel.com',
  'heilyn.nguyen@deel.com',
  'james.porter@deel.com',
  'jamie.merrill@deel.com',
  'jasmina.messaoud@deel.com',
  'jason.haddon@deel.com',
  'jessica.lascar@deel.com',
  'joe.stevens@deel.com',
  'jonathan.wilington@letsdeel.com',
  'jose.castillo@deel.com',
  'juan.escallon@deel.com',
  'juarez.mendes@deel.com',
  'julieta.solla@deel.com',
  'kamila.hulanicka@deel.com',
  'kayoung.yun@deel.com',
  'kiko.piqueras@deel.com',
  'kumaraguru@deel.com',
  'kunal.drego@deel.com',
  'laura.foletto@deel.com',
  'linda.cieniawska@deel.com',
  'lucas.pazin@deel.com',
  'luis.mayoral@deel.com',
  'marc.aquino@deel.com',
  'marcelo.scharlaucoelho@deel.com',
  'maria.montenegro@deel.com',
  'maria.moya@deel.com',
  'mariana.reis@deel.com',
  'marijana.solari@deel.com',
  'mario.munoz@deel.com',
  'matteo.martin@deel.com',
  'maximiliano.maggioni@deel.com',
  'melihhan.bozok@deel.com',
  'melissa.pereira@deel.com',
  'muhammed@deel.com',
  'nik.savic@deel.com',
  'pamela.sanchez@deel.com',
  'pantelis.petmezas@deel.com',
  'pavel.panioukin@deel.com',
  'pierre.kleinhouse@deel.com',
  'pilar.espil@deel.com',
  'ramya.thalmann@deel.com',
  'rozina.szogyenyi@deel.com',
  'sefik.mujkic@deel.com',
  'semi.lee@deel.com',
  'sergio.jimbel@deel.com',
  'shahriyar.m@deel.com',
  'tanya.sharma@deel.com',
  'thais.souza@deel.com',
  'thomas.mourao@deel.com',
  'travis.smith@deel.com',
  'varun.aggarwal@deel.com',
  'viktor.gnedin@deel.com',
  'virginia.venegas@deel.com',
  'william.montout@deel.com',
  'yevhen.syliutin@deel.com',
  'yuri.passossoares@deel.com',
];

const DISCIPLINE_ACCESS: Record<string, Set<string>> = {
  'Design': new Set(DESIGN_EMAILS),
};

const ADMINS = new Set([
  'avi.ashkenazi@deel.com',
]);

/**
 * Returns the list of disciplines a user is allowed to see.
 * Returns null for admins and unknown emails (unrestricted access).
 */
export function getAllowedDisciplines(email: string): string[] | null {
  const normalised = email.toLowerCase().trim();

  if (ADMINS.has(normalised)) return null;

  const allowed: string[] = [];

  for (const [discipline, emails] of Object.entries(DISCIPLINE_ACCESS)) {
    if (emails.has(normalised)) {
      allowed.push(discipline);
    }
  }

  return allowed.length > 0 ? allowed : null;
}
