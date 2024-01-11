import { useEffect, useState } from "react";

import axios from "axios";

import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type User = {
  id: string;
  login: string;
  avatar_url: string;
  html_url: string;
  repos_url: string;
};

export type Repo = {
  id: string;
  name: string;
  html_url: string;
  avatar_url: string;
  language: string;
  forks_count: number;
  stargazers_count: number;
};

const sorting = [
  { value: "stars", label: "Stars" },
  { value: "forks", label: "Forks" },
  { value: "original", label: "Original" },
];

const App = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<User[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [sort, setSort] = useState("original");

  const searchUsers = async (username: string) => {
    console.log(`Searching for ${username}`);
    if (!username) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.github.com/search/users?q=${username}`
      );
      console.log(response.data.items);
      setResults(response.data.items);
      repoFromUser(response.data.items[0]);
    } catch (error) {
      console.error(`Error fetching`, error);
    }
    setIsLoading(false);
  };

  const repoFromUser = async (user: User) => {
    setIsLoading(true);
    try {
      const response = await axios.get(user.repos_url);
      console.log(response.data);
      setRepos(response.data);
    } catch (error) {
      console.error(`Error fetching`, error);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchUsers(username);
    }
  };

  useEffect(() => {
    if (sort === "stars") {
      setRepos(repos.sort((a, b) => b.stargazers_count - a.stargazers_count));
    }
    if (sort === "forks") {
      setRepos(repos.sort((a, b) => b.forks_count - a.forks_count));
    }
    if (sort === "original") {
      setRepos(
        repos.sort(
          (a, b) =>
            b.stargazers_count +
            b.forks_count -
            a.stargazers_count -
            a.forks_count
        )
      );
    }
  }, [sort]);

  return (
    <div className="mt-8 px-4 py-4">
      <div>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder="Search for a user's repos"
          className="mb-2"
        />
        <Button
          onClick={() => searchUsers(username)}
          disabled={isLoading || !username}
        >
          {isLoading ? "Loading..." : "Search Users"}
        </Button>
      </div>

      {sorting.map((sortOption) => (
        <Button
          key={sortOption.value}
          onClick={() => setSort(sortOption.value)}
          className="mr-2"
        >
          {sortOption.label}
        </Button>
      ))}

      <div>
        {repos.map((repo) => (
          <div key={repo.id} className="grid grid-cols-2 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{repo.name}</CardTitle>
                <CardDescription>{repo.html_url}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-row gap-4">
                <p>{repo.language ? repo.language : "Others"} </p>
                <p>Fork Count: {repo.forks_count}</p>
                <p>Star Count: {repo.stargazers_count}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
