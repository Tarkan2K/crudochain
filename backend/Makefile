CXX = g++
CC = gcc
CXXFLAGS = -std=c++17 -Wall -Iinclude
CFLAGS = -std=c99 -Wall -Iinclude -O3
LDFLAGS = -lpthread

SRC_CPP = src/main.cpp
SRC_C = src/monocypher.c
OBJ = $(SRC_CPP:.cpp=.o) $(SRC_C:.c=.o)
TARGET = crudochain

all: $(TARGET)

$(TARGET): $(OBJ)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJ) $(TARGET)
