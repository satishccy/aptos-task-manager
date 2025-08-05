#[test_only]
module task_manager_addr::test_task_manager {
    use std::string;
    use task_manager_addr::task_manager;

    #[test(sender = @task_manager_addr)]
    fun test_task_manager(sender: &signer) {
        task_manager::init_module_for_test(sender);

        task_manager::create_task(sender, string::utf8(b"title"), string::utf8(b"description"));

        let (title, description, completed) = task_manager::get_task();
        assert!(title == string::utf8(b"title"), 1);
        assert!(description == string::utf8(b"description"), 2);
        assert!(completed == false, 3);

        task_manager::complete_task(sender);

        let (_, _, completed) = task_manager::get_task();
        assert!(completed == true, 4);
    }
}