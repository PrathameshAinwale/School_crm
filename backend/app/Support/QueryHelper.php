<?php

namespace App\Support {
    class QueryHelper
    {
        /**
         * Escape special characters for a LIKE query so the search term matches literally.
         * Escapes '%', '_', and the backslash escape character itself.
         *
         * @param string|null $value
         * @return string
         */
        public static function escapeLike(?string $value): string
        {
            if ($value === null || $value === '') {
                return '';
            }

            return addcslashes($value, '%_\\');
        }
    }
}

namespace {
    if (!function_exists('escape_like')) {
        function escape_like(?string $value): string
        {
            return \App\Support\QueryHelper::escapeLike($value);
        }
    }
}
