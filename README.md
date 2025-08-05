# Aptos Task Manager

A decentralized task management application built on the Aptos blockchain, providing a transparent and immutable platform for managing tasks.

## Vision

To create a suite of decentralized productivity tools that give users full ownership and control over their data, leveraging Web3 to build a more transparent and user-centric digital world.

## Smart Contract Details

The core logic is encapsulated in the `task_manager.move` smart contract. It uses a central `TaskBoard` object to store all tasks in a `Table`. Each `Task` has an owner, title, description, completion status, and a list of authorized users.

**Key Functions:**
- `create_task`: Creates a new task, assigning ownership to the transaction sender.
- `complete_task`: Marks a task as completed. Can only be called by the task owner or an authorized user.
- `add_authorized_user`: Allows the task owner to grant completion permissions to other users.
- `remove_authorized_user`: Allows the task owner to revoke completion permissions.
- `get_task`: A view function to retrieve the details of a specific task.

## Key Features

- **Decentralized & Immutable:** Tasks are stored on the Aptos blockchain.
- **Ownership & Permissions:** Each task has a designated owner with the ability to grant permissions to others.
- **Modern Frontend:** A responsive and fast user experience built with Next.js and React.
- **Wallet Integration:** Connects with Aptos wallets like Petra and Martian.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Aptos CLI](https://aptos.dev/cli-tools/aptos-cli/install-aptos-cli)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd aptos-task-manager
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Copy the sample environment file and update it with your deployed contract address.
    ```bash
    cp .env.sample .env
    ```

4.  **Compile and Publish the Smart Contract:**
    Use the scripts in `scripts/move/` to manage the contract.
    - **Compile:** `node scripts/move/compile.js`
    - **Publish:** `node scripts/move/publish.js`

    After publishing, copy the new module address into your `.env` file.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Future Scope

- **Task Collaboration:** Assign tasks to other Aptos accounts.
- **Deadlines & Reminders:** Implement on-chain due dates.
- **Tokenized Rewards:** Integrate a Fungible Asset to reward task completion.
- **Task Organization:** Add categories and tags for better organization.

## Screenshots

*Please add screenshots of your application here to give users a visual overview.*