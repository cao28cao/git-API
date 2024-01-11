import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGithub } from "react-icons/fa";

export type User = {
  id: string;
  login: string;
  avatar_url: string;
  html_url: string;
  repos_url: string;
};

export type Repo = {
  id: number;
  created_at: number;
  name: string;
  html_url: string;
  avatar_url: string;
  language: string;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  owner: {
    avatar_url: string;
  };
};

const sorting = [
  { value: "default", label: "Default" },
  { value: "stars", label: "Stars" },
  { value: "forks", label: "Forks" },
  { value: "original", label: "Original" },
];

const App = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setResults] = useState<User[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [sort, setSort] = useState("default");

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
    switch (sort) {
      case "stars":
        setRepos((repos) =>
          [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)
        );
        break;
      case "forks":
        setRepos((repos) =>
          [...repos].sort((a, b) => b.forks_count - a.forks_count)
        );
        break;
      case "original":
        setRepos((repos) =>
          [...repos].sort(
            (a, b) =>
              b.stargazers_count +
              b.watchers_count +
              b.forks_count -
              (a.stargazers_count + a.watchers_count + a.forks_count)
          )
        );
        break;
      case "default":
        setRepos((repos) => [...repos].sort((a, b) => b.id - a.id));
        break;
      default:
        break;
    }
  }, [sort]);

  return (
    <>
      <div className="header">
        <h1>Aggregation App</h1>
        <FaGithub className="github" />
      </div>
      <div className="search-user">
        <div>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder="Search for a user's repos"
            className="input-search"
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
            variant={sort === sortOption.value ? "default" : "outline"}
            className={`button-sort ${
              sort === sortOption.value ? "button-active" : ""
            }`}
            disabled={isLoading}
          >
            {sortOption.label}
          </Button>
        ))}

        <div className="repo-list">
          {repos.map((repo, index) => (
            <div key={repo.id} className="repo-card">
              <Card>
                <div>{index + 1}</div>

                <img
                  src={repo.owner.avatar_url}
                  alt="alt"
                  width={48}
                  height={48}
                />
                <CardHeader>
                  <CardTitle>{repo.name}</CardTitle>
                </CardHeader>
                <CardContent className="card-content">
                  <p>{repo.language ? repo.language : "Others"} </p>
                  <p>Fork Count: {repo.forks_count}</p>
                  <p>Star Count: {repo.stargazers_count}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default App;
