// Extensible Coding Profile Adapter Architecture
// Each adapter implements ICodingProfileAdapter for consistent fetching

export interface CodingProfileData {
  platform: string;
  username: string;
  rating: number;
  globalRank: number;
  problemsSolved: number;
  streak: number;
  badges?: string[];
  recentSubmissions?: number;
}

export interface ICodingProfileAdapter {
  platform: string;
  fetchProfile(username: string): Promise<CodingProfileData>;
}

// LeetCode Adapter (uses public GraphQL endpoint)
export class LeetCodeAdapter implements ICodingProfileAdapter {
  platform = 'LeetCode';

  async fetchProfile(username: string): Promise<CodingProfileData> {
    try {
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{
            matchedUser(username: "${username}") {
              submitStats { acSubmissionNum { difficulty count } }
              profile { ranking starRating }
            }
          }`,
        }),
      });

      if (!response.ok) throw new Error('LeetCode API unavailable');
      const data = await response.json();
      const user = data?.data?.matchedUser;

      if (!user) throw new Error('User not found');

      const totalSolved = user.submitStats?.acSubmissionNum?.reduce(
        (sum: number, item: any) => sum + (item.count || 0),
        0
      ) || 0;

      return {
        platform: this.platform,
        username,
        rating: user.profile?.starRating || 0,
        globalRank: user.profile?.ranking || 0,
        problemsSolved: totalSolved,
        streak: 0,
      };
    } catch {
      // Fallback: return placeholder indicating fetch failed
      return {
        platform: this.platform,
        username,
        rating: 0,
        globalRank: 0,
        problemsSolved: 0,
        streak: 0,
      };
    }
  }
}

// GitHub Adapter (uses public REST API)
export class GitHubAdapter implements ICodingProfileAdapter {
  platform = 'GitHub';

  async fetchProfile(username: string): Promise<CodingProfileData> {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) throw new Error('GitHub API error');
      const user = await response.json();

      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
      const repos = reposResponse.ok ? await reposResponse.json() : [];

      const totalStars = Array.isArray(repos)
        ? repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0)
        : 0;

      return {
        platform: this.platform,
        username,
        rating: totalStars,
        globalRank: user.followers || 0,
        problemsSolved: user.public_repos || 0,
        streak: 0,
        badges: repos.slice(0, 5).map((r: any) => r.language).filter(Boolean),
      };
    } catch {
      return { platform: this.platform, username, rating: 0, globalRank: 0, problemsSolved: 0, streak: 0 };
    }
  }
}

// Codeforces Adapter (uses public REST API)
export class CodeforcesAdapter implements ICodingProfileAdapter {
  platform = 'Codeforces';

  async fetchProfile(username: string): Promise<CodingProfileData> {
    try {
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
      if (!response.ok) throw new Error('Codeforces API error');
      const data = await response.json();
      const user = data?.result?.[0];

      if (!user) throw new Error('User not found');

      return {
        platform: this.platform,
        username,
        rating: user.rating || 0,
        globalRank: user.rank ? 0 : 0,
        problemsSolved: 0, // requires separate submission API call
        streak: 0,
      };
    } catch {
      return { platform: this.platform, username, rating: 0, globalRank: 0, problemsSolved: 0, streak: 0 };
    }
  }
}

// CodeChef Adapter (extensible — no reliable public API, placeholder adapter)
export class CodeChefAdapter implements ICodingProfileAdapter {
  platform = 'CodeChef';

  async fetchProfile(username: string): Promise<CodingProfileData> {
    // CodeChef does not have a stable public API.
    // This adapter is designed to be extended with web scraping or unofficial APIs.
    return {
      platform: this.platform,
      username,
      rating: 0,
      globalRank: 0,
      problemsSolved: 0,
      streak: 0,
    };
  }
}

// HackerRank Adapter (extensible placeholder)
export class HackerRankAdapter implements ICodingProfileAdapter {
  platform = 'HackerRank';

  async fetchProfile(username: string): Promise<CodingProfileData> {
    return {
      platform: this.platform,
      username,
      rating: 0,
      globalRank: 0,
      problemsSolved: 0,
      streak: 0,
    };
  }
}

// GeeksforGeeks Adapter (extensible placeholder)
export class GeeksforGeeksAdapter implements ICodingProfileAdapter {
  platform = 'GeeksforGeeks';

  async fetchProfile(username: string): Promise<CodingProfileData> {
    return {
      platform: this.platform,
      username,
      rating: 0,
      globalRank: 0,
      problemsSolved: 0,
      streak: 0,
    };
  }
}

// Adapter Registry — single point of access
export class CodingProfileAdapterRegistry {
  private adapters: Map<string, ICodingProfileAdapter> = new Map();

  constructor() {
    this.register(new LeetCodeAdapter());
    this.register(new GitHubAdapter());
    this.register(new CodeforcesAdapter());
    this.register(new CodeChefAdapter());
    this.register(new HackerRankAdapter());
    this.register(new GeeksforGeeksAdapter());
  }

  register(adapter: ICodingProfileAdapter) {
    this.adapters.set(adapter.platform.toLowerCase(), adapter);
  }

  getAdapter(platform: string): ICodingProfileAdapter | undefined {
    return this.adapters.get(platform.toLowerCase());
  }

  getSupportedPlatforms(): string[] {
    return Array.from(this.adapters.keys());
  }

  async fetchProfile(platform: string, username: string): Promise<CodingProfileData> {
    const adapter = this.getAdapter(platform);
    if (!adapter) {
      throw new Error(`No adapter registered for platform: ${platform}`);
    }
    return adapter.fetchProfile(username);
  }
}

export const adapterRegistry = new CodingProfileAdapterRegistry();
