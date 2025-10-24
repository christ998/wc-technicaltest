import type { GithubUserApi, User } from '../types/types';

export class UserAdapter {
  static convert(user: GithubUserApi): User {
    return {
      avatarUrl: user.avatar_url,
      bio: user.bio,
      name: user.name,
      publicRepos: user.public_repos,
      htmlUrl: user.html_url,
      followers: user.followers,
      following: user.following,
      updatedAt: user.updated_at,
    };
  }
}
