import type { RomanticConfig } from '../types'

/**
 * ROMANTIC DATE INVITATION CONFIGURATION
 * --------------------------------------
 * Easily customize names, texts, choices, and times here!
 * If recipientName or senderName is left empty (""), the website uses
 * natural, charming defaults without assuming any names.
 */
export const ROMANTIC_CONFIG: RomanticConfig = {
  // Personalization (leave empty "" for generic cute defaults, or fill in)
  recipientName: '', // e.g. "Maya" or ""
  senderName: '', // e.g. "Alex" or ""

  // Screen 1: The Invitation
  invitation: {
    heading: 'Hey, you! 💗',
    question: 'Will you go on a date with me?',
    subtext: 'I have something special planned for us...',
    yesButtonText: 'Yes, absolutely! 💕',
    noButtonText: 'No 🙈',
    noButtonPlayfulTexts: [
      'No 🙈',
      'Are you sure? 🥺',
      'Give me a chance! 💗',
      'Wait, think about the snacks! 🍕',
      'Pretty please? 🌸',
      'Click the pink one! ✨',
      'Nice try, too fast! 😉',
      "Don't break my heart! 💔",
      'Look at the left button! 👈💖',
      'I promise you will smile! 🌟',
    ],
  },

  // Screen 2: Acceptance
  acceptance: {
    heading: 'WAIT... YOU SAID YES?! 🥹💖',
    subtext: "You just made my day! Now let's plan our little date.",
    buttonText: "Let's Plan Our Date ✨",
  },

  // Screen 3: Date Selection
  datePicker: {
    heading: 'When are you free, cutie? 📅',
    subtext: 'Choose a day for our little adventure.',
  },

  // Screen 4: Time Selection
  timePicker: {
    heading: 'What time works for you? ⏰',
    subtext: "Pick a time and I'll be there!",
    options: [
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '3:00 PM',
      '5:00 PM',
      '6:00 PM',
      '7:00 PM',
      '8:00 PM',
    ],
  },

  // Screen 5: Date Food & Drink Choices (Coffee, Tea + classic date dinner/food options)
  foodChoices: {
    heading: "What's our date food mood? 🍽️",
    subtext: 'Whether it’s coffee, tea, or a delicious dinner — you choose!',
    options: [
      {
        id: 'coffee',
        name: 'Coffee Date',
        emoji: '☕',
        subtitle: 'Warm & cozy',
        description: 'Latte art, cafe vibes & sweet talks',
      },
      {
        id: 'tea',
        name: 'Tea Date',
        emoji: '🍵',
        subtitle: 'Calm & soothing',
        description: 'Hot tea, relaxing sips & cozy chats',
      },
      {
        id: 'pizza',
        name: 'Pizza',
        emoji: '🍕',
        subtitle: 'Classic comfort',
        description: 'Cheesy slices & late-night laughs',
      },
      {
        id: 'sushi',
        name: 'Sushi',
        emoji: '🍣',
        subtitle: 'Fancy vibes',
        description: 'Fresh rolls & aesthetic dinner',
      },
      {
        id: 'pasta',
        name: 'Pasta',
        emoji: '🍝',
        subtitle: 'Italian romance',
        description: 'Candlelight & twirling pasta',
      },
      {
        id: 'burgers',
        name: 'Burgers',
        emoji: '🍔',
        subtitle: 'Casual & fun',
        description: 'Juicy burgers & crispy fries',
      },
    ],
  },



  // Screen 6: Our Date Agreement
  agreement: {
    heading: "IT'S A DATE! 💌",
    subtitle: 'Officially making plans with you.',
    terms: [
      'One evening of good vibes.',
      'Unlimited conversation and laughter.',
      'At least one memorable moment.',
      'No boring conversations allowed.',
      'Dessert is negotiable. Extra smiles are mandatory.',
    ],
    costText: 'Cost: Unlimited love 💖',
    checkboxLabel: 'I agree to have a lovely time with you 💗',

    sealButtonText: 'Seal Our Date 💖',
  },

  // Screen 7: Final Celebration
  celebration: {
    heading: "IT'S OFFICIALLY A DATE! 🎉💗",
    subtext: "I can't wait to spend this time with you!",
    copySuccessText: 'Date details copied to clipboard! 📋✨',
  },
}
