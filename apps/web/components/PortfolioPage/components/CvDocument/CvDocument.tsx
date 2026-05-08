import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Styles,
  Text,
  View,
} from '@react-pdf/renderer'

type TextSegment = {
  text: string
  bold?: boolean
  italic?: boolean
  link?: string
}

export type CvSkillArea = {
  title: string
  skills: TextSegment[][]
}

export type CvExperienceEntry = {
  company: string
  role: string
  period: string
  bullets: TextSegment[][]
}

export type CvOtherEntry = {
  name: TextSegment[]
  period: string
  highlights: TextSegment[][]
}

export type CvDocumentProps = {
  name: string
  title: string
  location: string
  email: string
  photoUrl: string
  summary: string
  profileSectionTitle: string
  skillsSectionTitle: string
  skillAreas: CvSkillArea[]
  experienceSectionTitle: string
  experienceEntries: CvExperienceEntry[]
  otherSectionTitle: string
  otherEntries: CvOtherEntry[]
}

const COLORS = {
  black: '#000000',
  white: '#FBFBFB',
  green: '#98DFD6',
  blue: '#00235B',
  lightGray: '#f2f2f2',
  textDark: '#111111',
  textGray: '#555555',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.white,
    fontSize: 9,
    color: COLORS.textDark,
    paddingTop: 16,
    paddingHorizontal: 28,
    paddingBottom: 16,
  },
  header: {
    backgroundColor: COLORS.black,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: -16,
    marginHorizontal: -28,
    marginBottom: 16,
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    objectFit: 'cover',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    color: COLORS.white,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 12,
    color: COLORS.green,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactText: {
    fontSize: 9,
    color: COLORS.white,
    opacity: 0.75,
  },
  body: {},
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.green,
    paddingBottom: 3,
    marginBottom: 8,
  },
  summary: {
    fontSize: 9,
    color: COLORS.textGray,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  skillsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  skillArea: {
    marginBottom: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillAreaTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textDark,
    width: 70,
    flexShrink: 0,
  },
  skillAreaContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillText: {
    fontSize: 9,
    color: COLORS.textGray,
  },
  experienceEntry: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textDark,
  },
  entryPeriod: {
    fontSize: 8,
    color: COLORS.textGray,
    fontFamily: 'Helvetica-Oblique',
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    fontSize: 9,
    color: COLORS.green,
    marginRight: 4,
    width: 8,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.textGray,
    lineHeight: 1.4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  italic: {
    fontFamily: 'Helvetica-Oblique',
  },
  link: {
    color: '#3AAFA3',
    textDecoration: 'underline',
    letterSpacing: 0.3,
  },
  otherEntry: {
    marginBottom: 8,
  },
  otherEntryHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
})

function RichText({
  segments,
  style,
}: {
  segments: TextSegment[]
  style?: Styles[string]
}) {
  return (
    <Text style={style}>
      {segments.map(({ text, bold, italic, link }, i) =>
        link ? (
          <Link key={i} href={link} style={styles.link}>
            {text}
          </Link>
        ) : (
          <Text
            key={i}
            style={bold ? styles.bold : italic ? styles.italic : undefined}
          >
            {text}
          </Text>
        ),
      )}
    </Text>
  )
}

export function CvDocument({
  name,
  title,
  location,
  email,
  photoUrl,
  summary,
  profileSectionTitle,
  skillsSectionTitle,
  skillAreas,
  experienceSectionTitle,
  experienceEntries,
  otherSectionTitle,
  otherEntries,
}: CvDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={photoUrl} style={styles.photo} />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.jobTitle}>{title}</Text>
            <View style={styles.contactRow}>
              <Text style={styles.contactText}>{location}</Text>
              <Text style={styles.contactText}>·</Text>
              <Text style={styles.contactText}>{email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{profileSectionTitle}</Text>
            <Text style={styles.summary}>{summary}</Text>
            <Text style={styles.skillsTitle}>{skillsSectionTitle}</Text>
            {skillAreas.map(({ title: areaTitle, skills }) => (
              <View key={areaTitle} style={styles.skillArea}>
                <Text style={styles.skillAreaTitle}>{areaTitle}:</Text>
                <View style={styles.skillAreaContent}>
                  {skills.map((segments, si) => (
                    <RichText
                      key={si}
                      segments={[
                        ...segments,
                        ...(si < skills.length - 1 ? [{ text: ',  ' }] : []),
                      ]}
                      style={styles.skillText}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{experienceSectionTitle}</Text>
            {experienceEntries.map(({ company, role, period, bullets }) => (
              <View key={company} style={styles.experienceEntry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {company} — {role}
                  </Text>
                  <Text style={styles.entryPeriod}>{period}</Text>
                </View>
                {bullets.map((segments, bi) => (
                  <View key={bi} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <RichText segments={segments} style={styles.bulletText} />
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{otherSectionTitle}</Text>
            {otherEntries.map(({ name: entryName, period, highlights }, i) => (
              <View key={i} style={styles.otherEntry}>
                <View style={styles.otherEntryHeader}>
                  <RichText
                    segments={[
                      ...entryName,
                      ...(period ? [{ text: `  ${period}` }] : []),
                    ]}
                    style={styles.entryTitle}
                  />
                </View>
                {highlights.map((segments, hi) => (
                  <View key={hi} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <RichText segments={segments} style={styles.bulletText} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}
