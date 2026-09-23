from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 500

    def get_paginated_response(self, data):
        page = self.page
        paginator = page.paginator
        page_size = self.get_page_size(self.request) or paginator.per_page
        total_pages = (paginator.count + page_size - 1) // page_size if page_size else 1
        return Response(
            {
                "count": paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "totalPages": total_pages,
                "results": data,
            }
        )
