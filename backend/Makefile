# C++ Backend Makefile
CXX = g++
CXXFLAGS = -std=c++17 -O2 -Wall -Wextra -pthread

all: algo_server algo_cli

algo_server: server.cpp algorithms.hpp
	$(CXX) $(CXXFLAGS) server.cpp -o algo_server

algo_cli: cli.cpp algorithms.hpp
	$(CXX) $(CXXFLAGS) cli.cpp -o algo_cli

clean:
	rm -f algo_server algo_cli *.o

.PHONY: all clean
