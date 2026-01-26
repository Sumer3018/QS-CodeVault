from rich.console import Console

console = Console()


def log_info(msg: str):
    console.print(f"[bold green][INFO][/bold green] {msg}")


def log_error(msg: str):
    console.print(f"[bold red][ERROR][/bold red] {msg}")
