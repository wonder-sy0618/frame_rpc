workflow "New workflow" {
  on = "push"
  resolves = ["docker://centos"]
}

action "docker://centos" {
  uses = "docker://centos"
  secrets = ["GITHUB_TOKEN"]
  runs = "sh .github/test.sh"
}
