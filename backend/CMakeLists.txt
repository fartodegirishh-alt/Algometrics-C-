cmake_minimum_required(VERSION 3.10)
project(AlgoMetricsCppBackend VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Threads REQUIRED)

add_executable(algo_server server.cpp algorithms.hpp)
target_link_libraries(algo_server PRIVATE Threads::Threads)

add_executable(algo_cli cli.cpp algorithms.hpp)
target_link_libraries(algo_cli PRIVATE Threads::Threads)
