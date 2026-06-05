export type SourceRegistryItem = {
  id: string;
  nameEn: string;
  nameNo: string;
  homepageUrl: string;
  rssUrl?: string;
  summaryEn: string;
  summaryNo: string;
};

export const sourceRegistry: SourceRegistryItem[] = [
  {
    id: 'dsb',
    nameEn: 'Directorate for Civil Protection (DSB)',
    nameNo: 'Direktoratet for samfunnssikkerhet og beredskap (DSB)',
    homepageUrl: 'https://www.dsb.no/',
    rssUrl: 'https://www.dsb.no/rss/rss-dsb---aktuelt/',
    summaryEn: 'Official civil protection updates and preparedness guidance.',
    summaryNo: 'Offisielle oppdateringer om samfunnssikkerhet og beredskap.'
  },
  {
    id: 'politiet-news',
    nameEn: 'Politiloggen',
    nameNo: 'Politiloggen',
    homepageUrl: 'https://www.politiet.no/politiloggen',
    summaryEn: 'Live incident updates from Norwegian police districts.',
    summaryNo: 'Direkte hendelsesoppdateringer fra politidistriktene.'
  },
  {
    id: 'politiet-beredskap',
    nameEn: 'Police Preparedness Advice',
    nameNo: 'Politiets råd om beredskap',
    homepageUrl: 'https://www.politiet.no/rad/beredskap',
    summaryEn: 'Preparedness advice for civilians from the police.',
    summaryNo: 'Beredskapsråd for sivile fra politiet.'
  },
  {
    id: 'jd',
    nameEn: 'Ministry of Justice and Public Security',
    nameNo: 'Justis- og beredskapsdepartementet',
    homepageUrl: 'https://www.regjeringen.no/no/dep/jd/id463/',
    rssUrl: 'https://www.regjeringen.no/no/rss/Rss/2581966/?ownerid=463',
    summaryEn: 'Latest ministry updates from regjeringen.no.',
    summaryNo: 'Siste oppdateringer fra regjeringen.no.'
  },
  {
    id: 'nve',
    nameEn: 'NVE News Archive',
    nameNo: 'NVE nyhetsarkiv',
    homepageUrl: 'https://www.nve.no/nyheter/nyhetsarkiv/',
    summaryEn: 'Official NVE news archive (no confirmed RSS endpoint).',
    summaryNo: 'Offisielt nyhetsarkiv fra NVE (ingen bekreftet RSS-endepunkt).'
  },
  {
    id: 'sivilforsvaret',
    nameEn: 'Civil Defence Updates',
    nameNo: 'Sivilforsvaret - aktuelt',
    homepageUrl: 'https://www.sivilforsvaret.no/aktuelt/',
    summaryEn: 'Official Civil Defence updates (no confirmed RSS endpoint).',
    summaryNo: 'Offisielle oppdateringer fra Sivilforsvaret (ingen bekreftet RSS-endepunkt).'
  },
  {
    id: 'met-no',
    nameEn: 'Norwegian Weather Service Alerts',
    nameNo: 'Meteorologisk institutt farevarsler',
    homepageUrl: 'https://www.met.no/vaer-og-klima/ekstremvaervarsler-og-andre-farevarsler',
    rssUrl: 'https://api.met.no/weatherapi/metalerts/2.0/current',
    summaryEn: 'Live weather warning feed from MET Norway.',
    summaryNo: 'Direkte feed med farevarsler fra Meteorologisk institutt.'
  }
];
