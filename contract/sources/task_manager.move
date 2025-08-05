module task_manager_addr::task_manager {
    use std::string::String;
    use std::signer;
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_std::table::{Self, Table};
    use aptos_framework::event::{Self};

    // --- Error Codes ---
    /// The caller is not the owner or an authorized user for the task.
    const E_NOT_AUTHORIZED: u64 = 1;
    /// The specified task ID does not exist.
    const E_TASK_NOT_FOUND: u64 = 2;
    /// The user being added to the authorized list already exists there.
    const E_USER_ALREADY_AUTHORIZED: u64 = 3;
    /// The user being removed from the authorized list was not found.
    const E_USER_NOT_IN_AUTH_LIST: u64 = 4;

    // --- Structs ---

    #[event]
    /// Event emitted when a new task is created. Contains the new task's ID.
    struct TaskCreatedEvent has drop, store {
        task_id: u64,
        creator: address
    }

    /// Represents a single task with its own ownership and authorization list.
    struct Task has key, store {
        owner: address,
        title: String,
        description: String,
        completed: bool,
        authorized_users: vector<address>
    }

    /// A central resource stored in the object that holds all tasks.
    struct TaskBoard has key {
        // A table to store multiple tasks, mapping a unique ID (u64) to a Task struct.
        tasks: Table<u64, Task>,
        // A counter to generate unique, sequential IDs for new tasks.
        task_counter: u64,
    }

    // This remains the same, used to get a signer for the object.
    struct BoardObjectController has key {
        extend_ref: ExtendRef
    }

    const BOARD_OBJECT_SEED: vector<u8> = b"task_manager_v2";

    // --- Initialization ---

    /// Initializes the contract by creating a named object to act as the central Task Board.
    fun init_module(sender: &signer) {
        let constructor_ref = &object::create_named_object(sender, BOARD_OBJECT_SEED);
        let board_object_signer = object::generate_signer(constructor_ref);

        // Store the controller for the object.
        move_to(
            &board_object_signer,
            BoardObjectController {
                extend_ref: object::generate_extend_ref(constructor_ref)
            }
        );

        // Store the main TaskBoard resource in the object.
        move_to(
            &board_object_signer,
            TaskBoard {
                tasks: table::new(),
                task_counter: 0,
            }
        );
    }

    // --- Entry Functions (Callable by Users) ---

    /// Creates a new task and assigns ownership to the sender.
    public entry fun create_task(
        sender: &signer,
        title: String,
        description: String,
        // A list of users to authorize from the beginning. Can be empty.
        initial_auth_users: vector<address>
    ) acquires TaskBoard {
        let sender_addr = signer::address_of(sender);
        let board = borrow_global_mut<TaskBoard>(get_board_obj_address());

        // Get the next available ID and increment the counter.
        let task_id = board.task_counter;
        board.task_counter = task_id + 1;

        // Create the new task.
        let new_task = Task {
            owner: sender_addr,
            title,
            description,
            completed: false,
            authorized_users: initial_auth_users
        };

        // Add the new task to the table.
        board.tasks.add(task_id, new_task);
        // Emit an event so off-chain clients can know the new task_id.
        event::emit(TaskCreatedEvent { task_id, creator: sender_addr });
    }

    /// Marks a specific task as completed.
    /// Can only be called by the task's owner or an authorized user.
    public entry fun complete_task(sender: &signer, task_id: u64) acquires TaskBoard {
        let sender_addr = signer::address_of(sender);
        let board = borrow_global_mut<TaskBoard>(get_board_obj_address());

        // Assert that the task exists.
        assert!(board.tasks.contains(task_id), E_TASK_NOT_FOUND);

        // Get a mutable reference to the task and check permissions.
        let task = board.tasks.borrow_mut(task_id);
        assert_is_authorized(task, sender_addr);

        // Mutate the state.
        task.completed = true;
    }

    /// Adds a new user to the authorized list for a specific task.
    /// Can only be called by the task's owner.
    public entry fun add_authorized_user(
        sender: &signer, task_id: u64, user_to_add: address
    ) acquires TaskBoard {
        let sender_addr = signer::address_of(sender);
        let board = borrow_global_mut<TaskBoard>(get_board_obj_address());

        assert!(board.tasks.contains(task_id), E_TASK_NOT_FOUND);

        let task = board.tasks.borrow_mut(task_id);

        // Only the owner can add new users.
        assert!(task.owner == sender_addr, E_NOT_AUTHORIZED);

        // Check if user is already in the list to prevent duplicates.
        let (is_present, _) = task.authorized_users.index_of(&user_to_add);
        assert!(!is_present, E_USER_ALREADY_AUTHORIZED);

        // Add the user.
        task.authorized_users.push_back(user_to_add);
    }

    /// Removes a user from the authorized list for a specific task.
    /// Can only be called by the task's owner.
    public entry fun remove_authorized_user(
        sender: &signer, task_id: u64, user_to_remove: address
    ) acquires TaskBoard {
        let sender_addr = signer::address_of(sender);
        let board = borrow_global_mut<TaskBoard>(get_board_obj_address());

        assert!(board.tasks.contains(task_id), E_TASK_NOT_FOUND);

        let task = board.tasks.borrow_mut(task_id);

        // Only the owner can remove users.
        assert!(task.owner == sender_addr, E_NOT_AUTHORIZED);

        // Find and remove the user.
        let (found, index) = task.authorized_users.index_of(&user_to_remove);
        assert!(found, E_USER_NOT_IN_AUTH_LIST);
        task.authorized_users.remove(index);
    }

    // --- View Function ---

    #[view]
    /// Returns the details of a specific task.
    public fun get_task(
        task_id: u64
    ): (address, String, String, bool, vector<address>) acquires TaskBoard {
        let board = borrow_global<TaskBoard>(get_board_obj_address());
        assert!(board.tasks.contains(task_id), E_TASK_NOT_FOUND);

        let task = board.tasks.borrow(task_id);
        (task.owner, task.title, task.description, task.completed, task.authorized_users)
    }

    // --- Internal Helper Functions ---

    /// Internal function to check if a user is the owner or in the authorized list.
    fun assert_is_authorized(task: &Task, user: address) {
        // Check if the user is the owner.
        if (task.owner == user) { return };

        // If not the owner, check if they are in the authorized list.
        let (is_present, _) = task.authorized_users.index_of(&user);
        assert!(is_present, E_NOT_AUTHORIZED);
    }

    fun get_board_obj_address(): address {
        object::create_object_address(&@task_manager_addr, BOARD_OBJECT_SEED)
    }
}

