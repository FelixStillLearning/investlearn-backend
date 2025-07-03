const calculateLevel = (xp) => {
  // Simple formula: level increases with the square root of XP
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const checkAchievements = async (user, module, io) => {
  // Example: Achievement for completing 3 modules
  if (user.gamification.completedModules.length >= 3 && !user.gamification.achievements.includes('Module Master')) {
    user.gamification.achievements.push('Module Master');
    // Optionally award XP for achievement
    // const achievementBadge = await Badge.findOne({ name: 'Module Master' });
    // if (achievementBadge) user.gamification.xp += achievementBadge.rewardXp;
    io.emit('new_notification', { userId: user._id, message: 'You earned the Module Master achievement!' }); // Assuming io is accessible here
    createSocialFeedEntry(user._id, 'achievement_earned', 'earned the Module Master achievement!');
  }
  // Add more achievement logic here
};

const updateLearningStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.gamification.streak.lastActivity) {
    // First activity, start streak
    user.gamification.streak.current = 1;
  } else {
    const lastActivity = new Date(user.gamification.streak.lastActivity);
    lastActivity.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      user.gamification.streak.current += 1;
    } else if (diffDays > 1) {
      // Gap in activity, reset streak
      user.gamification.streak.current = 1;
    }
  }
  user.gamification.streak.lastActivity = today;
  if (user.gamification.streak.current > user.gamification.streak.longest) {
    user.gamification.streak.longest = user.gamification.streak.current;
  }
};

module.exports = { calculateLevel, checkAchievements, updateLearningStreak };