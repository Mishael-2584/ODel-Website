<?php
namespace block_ueabbuilder\local;

defined('MOODLE_INTERNAL') || die();

/** A safe, machine-readable Course Builder publishing failure. */
final class publisher_exception extends \Exception {
    public function __construct(
        public readonly string $errorcode,
        string $message,
        public readonly int $revision = 0,
        int $status = 400,
    ) {
        parent::__construct($message, $status);
    }
}
