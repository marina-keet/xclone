/**
 * Service pour gérer les hashtags
 */
export class HashtagService {
  /**
   * Extraire les hashtags d'un texte
   * @param text Le texte à analyser
   * @returns Array des hashtags trouvés (sans le #)
   */
  static extractHashtags(text: string): string[] {
    if (!text) return []

    // Expression régulière pour détecter les hashtags
    // #[mot] où mot peut contenir des lettres, chiffres et underscores
    const hashtagRegex = /#([a-zA-ZÀ-ÿ0-9_]+)/g
    const hashtags: string[] = []
    let match

    while ((match = hashtagRegex.exec(text)) !== null) {
      const hashtag = match[1].toLowerCase() // Normaliser en minuscules
      if (hashtag && !hashtags.includes(hashtag)) {
        hashtags.push(hashtag)
      }
    }

    return hashtags
  }

  /**
   * Créer un slug à partir du nom du hashtag
   * @param name Le nom du hashtag
   * @returns Le slug formaté
   */
  static createSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9_]/g, '') // Garder seulement les lettres, chiffres et underscores
  }

  /**
   * Formater le texte d'un tweet en rendant les hashtags cliquables
   * @param text Le texte du tweet
   * @returns Le texte formaté avec les hashtags en HTML
   */
  static formatTextWithHashtags(text: string): string {
    if (!text) return ''

    // Remplacer les hashtags par des liens
    return text.replace(
      /#([a-zA-ZÀ-ÿ0-9_]+)/g,
      '<a href="/hashtag/$1" class="text-blue-400 hover:text-blue-300 hover:underline">#$1</a>'
    )
  }
}
