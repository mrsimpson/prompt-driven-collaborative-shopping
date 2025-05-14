- If you need to understand what this project is about, check the docs folder
  - The PDD (Product Design Description) is stored in (docs/pdd.md) and describes the functional specification about what we want to develop
  - The target architecture is documented in docs/arc42.md
- After each change in the code,
  - type check the code (by running pm run typecheck in the bash)
  - lint the code (by running npm run lint in the bash)
- After each **major** change in the code,

  - run the automated tests (by running pm run test in the bash)
  - adapt the implementation plan and check the boxes. Don't change anything except the progress ou've been working on unless explicitly requested
  - use the git git_add tool to add the changes to the staging area and the git git_commit tool with a message of the following pattern:

  ```text
  > {{The last prompt by the user}}

  {{A summary of the changes you performed after the last prompt and what was the reasoning behind those changes}}
  ```
